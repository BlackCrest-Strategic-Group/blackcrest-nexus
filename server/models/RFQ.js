const mongoose = require('mongoose');

const RFQSchema = new mongoose.Schema({
  title: String,
  quantity: Number,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('RFQ', RFQSchema);
