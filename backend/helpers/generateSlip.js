const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateOrderSlip(order, items, callback) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const fileName = `${order.customerName.replace(/\s+/g, '_')}-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, `../slips/${fileName}`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  // ----------------- Header -----------------
  doc
    .fillColor('#0B3D91')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('OrderBoard - Order Slip', { align: 'center' })
    .moveDown(1.5);

  // ----------------- Customer Info -----------------
  doc
    .fontSize(12)
    .fillColor('#000')
    .font('Helvetica')
    .text(`Customer Name: ${order.customerName}`)
    .text(`WhatsApp: ${order.whatsappNumber}`)
    .text(`Order Date: ${new Date().toLocaleDateString()}`)
    .moveDown(1);

  // ----------------- Table Header -----------------
  const tableTop = doc.y;
  doc
    .fillColor('#0B3D91')
    .fontSize(13)
    .font('Helvetica-Bold');

  doc.text('Product', 70, tableTop, { width: 220 });
  doc.text('Quantity', 300, tableTop, { width: 100, align: 'center' });
  doc.text('Price (R)', 420, tableTop, { width: 100, align: 'right' });

  doc
    .strokeColor('#cccccc')
    .lineWidth(1)
    .moveTo(50, tableTop + 18)
    .lineTo(550, tableTop + 18)
    .stroke();

  // ----------------- Table Rows -----------------
  let total = 0;
  let rowY = tableTop + 25;

  doc.font('Helvetica').fillColor('#000').fontSize(12);

  items.forEach((item) => {
    const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
    total += itemTotal;

    doc.text(item.productName, 70, rowY, { width: 220 });
    doc.text(item.quantity.toString(), 300, rowY, { width: 100, align: 'center' });
    doc.text(`R${itemTotal.toFixed(2)}`, 420, rowY, { width: 100, align: 'right' });

    rowY += 20;
  });

  // ----------------- Line after items -----------------
  doc
    .strokeColor('#cccccc')
    .lineWidth(1)
    .moveTo(50, rowY + 5)
    .lineTo(550, rowY + 5)
    .stroke();

  // ----------------- Total -----------------
  doc
    .fontSize(14)
    .fillColor('#0B3D91')
    .font('Helvetica-Bold')
    .text(`Total: R${total.toFixed(2)}`, 420, rowY + 15, { width: 100, align: 'right' });

  // ----------------- Footer -----------------
  doc
    .moveDown(4)
    .fontSize(10)
    .fillColor('#999999')
    .font('Helvetica-Oblique')
    .text('Thank you for using OrderBoard!', { align: 'center' })
    .text('This slip was generated digitally and is valid without a signature.', { align: 'center' });

  doc.end();

  stream.on('finish', () => callback(null, filePath));
  stream.on('error', (err) => callback(err));
}

module.exports = generateOrderSlip;
