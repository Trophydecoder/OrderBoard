const { database } = require('../../configurations/DatabaseConnections');
const generateOrderSlip = require('../../helpers/generateSlip');
const axios = require('axios');
const path = require('path');

// ----------------- Helpers -----------------
const isOnlyLetters = str => /^[A-Za-z\s]+$/.test(str);
const isValidWhatsAppNumber = num => /^(0\d{9}|\+27\d{9})$/.test(num);
const convertToInternational = num => num.startsWith('0') ? '+27' + num.slice(1) : num;

const instanceId = 'instance128374';
const token = 'q5k4ty84gn526a4y';

const sendWhatsAppMessage = (to, msg) => {
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat?token=${token}`;
  return axios.post(url, { to, body: msg }, { headers: { 'Content-Type': 'application/json' } });
};

// ----------------- Create Order -----------------
module.exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customerName, whatsappNumber, items } = req.body;

    // --- Basic validation ---
    if (!customerName || !whatsappNumber || !items?.length)
      return res.status(400).json({ message: 'Missing required order data' });

    if (!isOnlyLetters(customerName))
      return res.status(400).json({ message: 'Customer name must contain only letters' });

    if (!isValidWhatsAppNumber(whatsappNumber))
      return res.status(400).json({ message: 'Invalid WhatsApp number' });

    if (items.some(i => !i.productName || !i.quantity || !i.price)) {
      return res.status(400).json({ message: 'Each item must have a productName, quantity, and price' });
    }

    const finalNumber = convertToInternational(whatsappNumber);

    const totalPrice = items.reduce((sum, i) => sum + parseFloat(i.price) * parseInt(i.quantity), 0);

    // --- Count monthly orders ---
    const countResult = await database.query(
      `SELECT COUNT(*)::int AS count
       FROM orders
       WHERE user_id = $1
         AND isDeleted = false
         AND EXTRACT(MONTH FROM orderDate) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM orderDate) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [userId]
    );

    const count = countResult.rows[0]?.count || 0;
    if (req.user.plan === 'Free' && count >= 18)
      return res.status(403).json({ message: 'Free plan limit reached: Max 15 orders per month' });

    // --- Get next order number ---
    const maxResult = await database.query(
      'SELECT COALESCE(MAX(user_order_number), 0) AS maxOrder FROM orders WHERE user_id = $1',
      [userId]
    );
    const nextOrderNumber = (maxResult.rows[0].maxorder || 0) + 1;

    // --- Insert order ---
    const orderResult = await database.query(
      `INSERT INTO orders (user_id, customerName, whatsappNumber, totalPrice, orderDate, user_order_number)
       VALUES ($1,$2,$3,$4,NOW(),$5) RETURNING id`,
      [userId, customerName, finalNumber, totalPrice, nextOrderNumber]
    );
    const orderId = orderResult.rows[0].id;

    // --- Insert items ---
    const itemValues = items.flatMap(i => [orderId, i.productName, i.quantity, i.price]);
    const placeholders = items.map((_, idx) => `($${idx*4+1},$${idx*4+2},$${idx*4+3},$${idx*4+4})`).join(',');
    await database.query(`INSERT INTO order_items (order_id, product_name, quantity, price) VALUES ${placeholders}`, itemValues);

    // --- Generate PDF slip ---
    const orderData = { customerName, whatsappNumber: finalNumber, totalPrice, userOrderNumber: nextOrderNumber };
    const pdfPath = await new Promise((resolve, reject) => 
      generateOrderSlip(orderData, items, (err, path) => err ? reject(err) : resolve(path))
    );

    const filename = path.basename(pdfPath);
    const publicPdfUrl = `http://localhost:3000/slips/${filename}`;
    const message = `🧾 *Order #${nextOrderNumber}*\n👤 Customer: ${customerName}\n💵 Total: R${totalPrice.toFixed(2)}\n📄 View Slip: ${publicPdfUrl}`;

    // --- Send WhatsApp message ---
    try {
      await sendWhatsAppMessage(finalNumber, message);
      return res.status(201).json({ status: 'success', message: 'Order created and WhatsApp sent successfully', orderNumber: nextOrderNumber, slipPath: publicPdfUrl });
    } catch (whatsappErr) {
      console.error('WhatsApp sending failed:', whatsappErr.response?.data || whatsappErr.message);
      return res.status(200).json({ status: 'partial_success', message: 'Order created but WhatsApp sending failed', orderNumber: nextOrderNumber, slipPath: publicPdfUrl });
    }

  } catch (err) {
    console.error('Server error creating order:', err);
    return res.status(500).json({ message: 'Server error creating order' });
  }
};






















// ----------------- Order History -----------------
module.exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search = '', sort = 'date_desc' } = req.query;

    // Map sort keys to valid column names and directions
    const sortMap = {
      date_asc: ['orderdate', 'ASC'],
      date_desc: ['orderdate', 'DESC'],
      name_asc: ['customername', 'ASC'],
      name_desc: ['customerName', 'DESC'],
      price_asc: ['totalprice', 'ASC'],
      price_desc: ['totalprice', 'DESC'],
    };
    const [col, dir] = sortMap[sort] || ['orderDate', 'DESC'];

    // Only allow valid column names for sorting to prevent SQL injection
    const validCols = ['orderdate', 'customername', 'totalprice'];
    const validDirs = ['ASC', 'DESC'];
    const sortCol = validCols.includes(col) ? col : 'orderdate';
    const sortDir = validDirs.includes(dir) ? dir : 'DESC';

    const sql = `
      SELECT id, user_order_number, customername, whatsappnumber, totalprice, orderdate
      FROM orders
      WHERE user_id = $1 AND isDeleted = false AND customername ILIKE $2
      ORDER BY ${sortCol} ${sortDir}
    `;

    const result = await database.query(sql, [userId, `%${search}%`]);

    if (!result.rows.length) {
      return res.status(200).json({ message: 'No orders found', orders: [] });
    }

    res.status(200).json({ orders: result.rows });
  } catch (err) {
    console.error('Error fetching order history:', err);
    res.status(500).json({ message: 'Failed to fetch order history' });
  }
};


























// ----------------- Frequent Customers -----------------
module.exports.getFrequentCustomers = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await database.query(
      `SELECT customerName, whatsappNumber, COUNT(*) AS orderCount
       FROM orders
       WHERE user_id = $1 AND isDeleted = false
       GROUP BY customerName, whatsappNumber
       HAVING COUNT(*) >= 5
       ORDER BY orderCount DESC`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch frequent customers' });
  }
};
























// ----------------- Frequent Customer Details -----------------
module.exports.getFrequentCustomerDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const customerName = req.params.customerName;

    if (!customerName) return res.status(400).json({ message: 'Customer name required' });

    const result = await database.query(
      `SELECT o.id AS orderId, o.user_order_number, o.customerName, o.whatsappNumber, 
              o.totalPrice, o.orderDate,
              oi.product_name, oi.quantity, oi.price
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1 AND o.customerName = $2
       ORDER BY o.orderDate DESC
       LIMIT 1`,
      [userId, customerName]
    );

    if (!result.rows.length) return res.status(404).json({ message: 'Customer not found' });

    const order = {
      orderId: result.rows[0].orderid,
      userOrderNumber: result.rows[0].user_order_number,
      customerName: result.rows[0].customername,
      whatsappNumber: result.rows[0].whatsappnumber,
      totalPrice: result.rows[0].totalprice,
      orderDate: result.rows[0].orderdate,
      items: result.rows.filter(r => r.product_name).map(r => ({ name: r.product_name, quantity: r.quantity, price: r.price }))
    };

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customer details' });
  }
};
