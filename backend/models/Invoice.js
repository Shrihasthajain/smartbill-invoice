const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  itemName: String,
  variant: String,
  quantity: Number,
  basePrice: Number,
  gstPercent: Number,
  discountType: { type: String, enum: ['percent', 'absolute'], default: 'percent' },
  discountValue: Number,
  rowTotal: Number,
  discount: Number
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: Date,
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  lineItems: [lineItemSchema],
  subtotal: Number,
  totalDiscount: Number,
  totalGST: Number,
  grandTotal: Number
}, { timestamps: true });

// Auto generate unique invoice number using timestamp
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);