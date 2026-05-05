const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: String,
  category: String,
  riskScore: Number,
  region: String
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
