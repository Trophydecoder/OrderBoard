const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateOrderSlip(order, items, callback) {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(__dirname, `../slips/${order.customerName}-${Date.now()}.pdf`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  // ✅ Header
  doc
    .fillColor('#0B3D91')
    .fontSize(24)
    .text('OrderBoard - Order Slip', { align: 'center' })
    .moveDown();

  // ✅ Customer info
  doc
    .fontSize(12)
    .fillColor('#000000')
    .text(`Customer Name: ${order.customerName}`, { continued: true })
    .text(`   WhatsApp: ${order.whatsappNumber}`)
    .text(`Date: ${new Date().toLocaleDateString()}`)
    .moveDown();

  // ✅ Table Header
  doc
    .fillColor('#0B3D91')
    .fontSize(14)
    .text('Product', 70, doc.y, { width: 200, bold: true })
    .text('Quantity', 250, doc.y, { width: 100, align: 'center', bold: true })
    .text('Price (R)', 350, doc.y, { width: 100, align: 'right', bold: true })
    .moveDown(0.5);

  doc
    .strokeColor('#cccccc')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  // ✅ Table Rows
  let total = 0;
  items.forEach((item) => {
    total += parseFloat(item.price * item.quantity);

    doc
      .fillColor('#000000')
      .fontSize(12)
      .text(item.productName, 70, doc.y + 5, { width: 200 })
      .text(item.quantity.toString(), 250, doc.y + 5, { width: 100, align: 'center' })
      .text(`R${parseFloat(item.price).toFixed(2)}`, 350, doc.y + 5, { width: 100, align: 'right' })
      .moveDown();
  });

  // ✅ Line after items
  doc
    .strokeColor('#cccccc')
    .lineWidth(1)
    .moveTo(50, doc.y + 10)
    .lineTo(550, doc.y + 10)
    .stroke();

  // ✅ Total Price
  doc
    .fontSize(14)
    .fillColor('#0B3D91')
    .text(`Total: R${total.toFixed(2)}`, 350, doc.y + 20, {
      width: 200,
      align: 'right',
      bold: true,
    });

  // ✅ Footer
  doc
    .moveDown(2)
    .fontSize(10)
    .fillColor('#999999')
    .text('Thank you for using OrderBoard.', { align: 'center' })
    .text('This slip was generated digitally.', { align: 'center' });

  doc.end();

  stream.on('finish', () => callback(null, filePath));
  stream.on('error', (err) => callback(err));
}

module.exports = generateOrderSlip;
