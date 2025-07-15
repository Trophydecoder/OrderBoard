const { database } = require('../../configurations/DatabaseConnections');
const generateOrderSlip = require('../../helpers/generateSlip');
const axios = require('axios');
const path = require('path');



// Helpers
function isOnlyLetters(str) {
  return /^[A-Za-z\s]+$/.test(str);
}
function isValidWhatsAppNumber(number) {
  return /^(0\d{9}|\+27\d{9})$/.test(number);
}
function convertToInternational(number) {
  return number.startsWith('0') ? '+27' + number.slice(1) : number;
}

// WhatsApp API Config
const instanceId = 'instance128374';
const token = 'q5k4ty84gn526a4y';

function sendWhatsAppMessage(toNumber, message) {
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat?token=${token}`;
  return axios.post(url, {
    to: toNumber,
    body: message
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Create Order Controller
module.exports.createOrder = (req, res) => {
  const userId = req.user.id;
  const { customerName, whatsappNumber, items } = req.body;

  // Input validation
  if (!customerName || !whatsappNumber || !items?.length) {
    return res.status(400).json({ message: 'Missing required order data' });
  }
  if (!isOnlyLetters(customerName)) {
    return res.status(400).json({ message: 'Customer name must contain only letters' });
  }
  if (!isValidWhatsAppNumber(whatsappNumber)) {
    return res.status(400).json({ message: 'Invalid WhatsApp number' });
  }
  const finalNumber = convertToInternational(whatsappNumber);

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
    return sum + itemTotal;
  }, 0);

  // Check free plan monthly limit
  const countQuery = `
    SELECT COUNT(*) AS count 
    FROM orders 
    WHERE user_id = ? 
      AND MONTH(orderDate) = MONTH(NOW()) 
      AND YEAR(orderDate) = YEAR(NOW())
      AND isDeleted = 0
  `;
  database.query(countQuery, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error checking order limit' });

    const count = result[0]?.count || 0;
    if (req.user.plan === 'Free' && count >= 15) {
      return res.status(403).json({ message: 'Free plan limit reached: Max 15 orders per month' });
    }

    // Find user-specific order number
    const findMaxQuery = `
      SELECT MAX(user_order_number) AS maxOrder
      FROM orders
      WHERE user_id = ?
    `;
    database.query(findMaxQuery, [userId], (maxErr, maxResult) => {
      if (maxErr) {
        console.error('Error finding max order number:', maxErr);
        return res.status(500).json({ message: 'Database error.' });
      }
      const nextOrderNumber = (maxResult[0].maxOrder || 0) + 1;

      // Insert order
      const insertSql = `
        INSERT INTO orders (user_id, customerName, whatsappNumber, totalPrice, orderDate, items, user_order_number)
        VALUES (?, ?, ?, ?, NOW(), ?, ?)
      `;
      const itemsJson = JSON.stringify(items);

      database.query(insertSql, [userId, customerName, finalNumber, totalPrice, itemsJson, nextOrderNumber], (err2, orderResult) => {
        if (err2) {
          console.error('Order insert error:', err2);
          return res.status(500).json({ message: 'Order insert failed' });
        }

        const order = {
          customerName,
          whatsappNumber: finalNumber,
          totalPrice,
          userOrderNumber: nextOrderNumber
        };

        // Generate slip
        generateOrderSlip(order, items, (err3, pdfPath) => {
          if (err3) {
            console.error('PDF generation failed:', err3);
            return res.status(500).json({ message: 'Order created but slip generation failed' });
          }

          const filename = path.basename(pdfPath);
          const publicPdfUrl = `http://localhost:3000/slips/${filename}`;
          const message = `🧾 *Order #${nextOrderNumber}*\n👤 Customer: ${customerName}\n💵 Total: R${totalPrice.toFixed(2)}\n📄 View Slip: ${publicPdfUrl}`;

          console.log("Sending WhatsApp message to:", finalNumber);
          console.log("Message:", message);

          sendWhatsAppMessage(finalNumber, message)
            .then(() => {
              return res.status(201).json({
                message: 'Order created and WhatsApp sent successfully',
                orderNumber: nextOrderNumber,
                slipPath: pdfPath
              });
            })
            .catch((whatsappErr) => {
              console.error('WhatsApp sending failed:', whatsappErr.response?.data || whatsappErr.message);
              return res.status(201).json({
                message: 'Order created but WhatsApp sending failed',
                orderNumber: nextOrderNumber,
                slipPath: pdfPath
              });
            });
        });
      });
    });
  });
};

module.exports.getOrderHistory = (req, res) => {
  const userId = req.user.id;
  const { search = '', sort = 'date_desc' } = req.query;

  // Sanitize and map sort options
  let sortSql;
  switch (sort) {
    case 'date_asc':
      sortSql = 'orderDate ASC';
      break;
    case 'name_asc':
      sortSql = 'customerName ASC';
      break;
    case 'name_desc':
      sortSql = 'customerName DESC';
      break;
    case 'price_asc':
      sortSql = 'totalPrice ASC';
      break;
    case 'price_desc':
      sortSql = 'totalPrice DESC';
      break;
    default:
      sortSql = 'orderDate DESC';
  }

  const sql = `
    SELECT id, customerName, whatsappNumber, totalPrice, orderDate
    FROM orders
    WHERE user_id = ? AND isDeleted = 0 AND customerName LIKE ?
    ORDER BY ${sortSql}
  `;

  database.query(sql, [userId, `%${search}%`], (err, results) => {
    if (err) {
      console.error('Order history fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch order history' });
    }

    return res.status(200).json(results);
  });
};






module.exports.getFrequentCustomers = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT customerName, whatsappNumber, COUNT(*) AS orderCount
    FROM orders
    WHERE user_id = ? AND isDeleted = 0
    GROUP BY customerName, whatsappNumber
    HAVING orderCount >= 5
    ORDER BY orderCount DESC
  `;

  database.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Frequent customers query failed:', err);
      return res.status(500).json({ message: 'Failed to fetch frequent customers' });
    }

    return res.status(200).json(results);
  });
};




module.exports.getFrequentCustomerDetails = (req, res) => {
  const userId = req.user.id;
  const customerName = req.params.customerName;

  if (!customerName) {
    return res.status(400).json({ message: 'Customer name required' });
  }

  // Get latest order for that customer by this user
  const orderSql = `
    SELECT o.id AS orderId, o.customerName, o.whatsappNumber, o.totalPrice, o.orderDate,
           oi.product_name, oi.quantity, oi.price
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ? AND o.customerName = ?
    ORDER BY o.orderDate DESC
    LIMIT 1
  `;

  database.query(orderSql, [userId, customerName], (err, results) => {
    if (err) {
      console.error('Error fetching frequent customer details:', err);
      return res.status(500).json({ message: 'Failed to fetch customer details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Format response:
    const order = {
      customerName: results[0].customerName,
      whatsappNumber: results[0].whatsappNumber,
      totalPrice: results[0].totalPrice,
      orderDate: results[0].orderDate,
      items: []
    };

    // Gather all order items from result rows
    results.forEach(row => {
      if (row.product_name) {
        order.items.push({
          name: row.product_name,
          quantity: row.quantity,
          price: row.price
        });
      }
    });

    return res.status(200).json(order);
  });
};
