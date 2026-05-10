const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create invoice
router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const due = new Date();
    due.setDate(due.getDate() + 15);
    invoice.dueDate = due;
    const saved = await invoice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET download PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

    const filename = `invoice-${invoice.invoiceNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    doc.pipe(res);

    // HEADER
    doc.fontSize(26).fillColor('#2E7D32').font('Helvetica-Bold').text('SmartBill', 50, 50);
    doc.fontSize(10).fillColor('#666').font('Helvetica').text('Smart Billing. Made Simple.', 50, 82);

    doc.fontSize(18).fillColor('#111').font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right', width: 145 });
    doc.fontSize(9).fillColor('#555').font('Helvetica')
      .text(`Invoice No: ${invoice.invoiceNumber}`, 400, 76, { align: 'right', width: 145 })
      .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 400, 89, { align: 'right', width: 145 })
      .text(`Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 400, 102, { align: 'right', width: 145 });

    doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#2E7D32').lineWidth(2).stroke();

    // BILLED TO
    doc.fontSize(10).fillColor('#2E7D32').font('Helvetica-Bold').text('BILLED TO:', 50, 135);
    doc.fontSize(11).fillColor('#111').font('Helvetica-Bold').text(invoice.customer.name, 50, 152);
    doc.fontSize(9).fillColor('#444').font('Helvetica')
      .text(`Phone: ${invoice.customer.phone}`, 50, 167)
      .text(`Email: ${invoice.customer.email}`, 50, 180)
      .text(`Address: ${invoice.customer.address}`, 50, 193, { width: 280 });

    // LINE ITEMS TABLE
    const tableTop = 250;
    const cols = { item: 50, variant: 150, qty: 238, price: 275, gst: 322, disc: 363, total: 470 };

    doc.rect(50, tableTop - 6, 495, 22).fillColor('#2E7D32').fill();
    doc.fontSize(8.5).fillColor('#fff').font('Helvetica-Bold')
      .text('Item', cols.item, tableTop, { width: 95 })
      .text('Variant', cols.variant, tableTop, { width: 83 })
      .text('Qty', cols.qty, tableTop, { width: 32, align: 'center' })
      .text('Price', cols.price, tableTop, { width: 42, align: 'right' })
      .text('GST%', cols.gst, tableTop, { width: 36, align: 'center' })
      .text('Discount', cols.disc, tableTop, { width: 100, align: 'right' })
      .text('Total (Rs.)', cols.total, tableTop, { width: 70, align: 'right' });

    let y = tableTop + 22;

    invoice.lineItems.forEach((item, i) => {
      const rowH = 24;
      const bg = i % 2 === 0 ? '#F9FBE7' : '#FFFFFF';
      doc.rect(50, y - 4, 495, rowH).fillColor(bg).fill();
      doc.rect(50, y - 4, 495, rowH).strokeColor('#e0e0e0').lineWidth(0.5).stroke();

      const discDisplay = item.discountType === 'percent'
        ? `${item.discountValue}%`
        : `Rs.${Number(item.discountValue).toFixed(2)}`;

      doc.fontSize(8.5).fillColor('#111').font('Helvetica')
        .text(item.itemName || '', cols.item, y, { width: 95 })
        .text(item.variant || '-', cols.variant, y, { width: 83 })
        .text(String(item.quantity), cols.qty, y, { width: 32, align: 'center' })
        .text(`Rs.${Number(item.basePrice).toFixed(2)}`, cols.price, y, { width: 42, align: 'right' })
        .text(`${item.gstPercent}%`, cols.gst, y, { width: 36, align: 'center' })
        .text(discDisplay, cols.disc, y, { width: 100, align: 'right' })
        .text(`Rs.${Number(item.rowTotal).toFixed(2)}`, cols.total, y, { width: 70, align: 'right' });

      y += rowH;
    });

    doc.moveTo(50, y).lineTo(545, y).strokeColor('#2E7D32').lineWidth(1).stroke();

    // SUMMARY BOX
    y += 20;
    doc.rect(350, y, 195, 100).fillColor('#F1F8E9').fill();
    doc.rect(350, y, 195, 100).strokeColor('#C8E6C9').lineWidth(0.5).stroke();

    const sx = 360;
    let sy = y + 12;

    doc.fontSize(9).font('Helvetica').fillColor('#555')
      .text('Subtotal:', sx, sy)
      .text(`Rs.${Number(invoice.subtotal).toFixed(2)}`, sx + 95, sy, { width: 80, align: 'right' });
    sy += 18;
    doc.fillColor('#c0392b')
      .text('Total Discount:', sx, sy)
      .text(`- Rs.${Number(invoice.totalDiscount).toFixed(2)}`, sx + 95, sy, { width: 80, align: 'right' });
    sy += 18;
    doc.fillColor('#1565C0')
      .text('Total GST:', sx, sy)
      .text(`+ Rs.${Number(invoice.totalGST).toFixed(2)}`, sx + 95, sy, { width: 80, align: 'right' });
    sy += 14;
    doc.moveTo(360, sy).lineTo(535, sy).strokeColor('#2E7D32').lineWidth(1).stroke();
    sy += 8;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2E7D32')
      .text('GRAND TOTAL:', sx, sy)
      .text(`Rs.${Number(invoice.grandTotal).toFixed(2)}`, sx + 95, sy, { width: 80, align: 'right' });

    // TERMS
    y += 120;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#ccc').lineWidth(0.5).stroke();
    y += 14;
    doc.fontSize(10).fillColor('#2E7D32').font('Helvetica-Bold').text('Terms & Conditions', 50, y);
    y += 16;
    doc.fontSize(8.5).fillColor('#555').font('Helvetica')
      .text('1. Payment Terms: Payment is due within 15 days of the invoice date.', 50, y)
      .text('2. Late Fees: A late fee of 2% per month will be applied to overdue balances.', 50, y + 13)
      .text('3. Jurisdiction: All disputes are subject to Bengaluru jurisdiction only.', 50, y + 26)
      .text('4. Thank you for choosing SmartBill!', 50, y + 39);

    // FOOTER
    doc.fontSize(8).fillColor('#aaa').font('Helvetica')
      .text('Generated by SmartBill Invoice System', 50, 770, { align: 'center', width: 495 });

    doc.end();

  } catch (err) {
    console.error('PDF Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;