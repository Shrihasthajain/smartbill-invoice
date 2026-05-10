const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  variants: [variantSchema],
  basePrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);