const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  poNumber: String,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  totalValue: Number,
  status: { type: String, default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
