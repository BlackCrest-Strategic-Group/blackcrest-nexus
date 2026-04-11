const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rfp', required: true, unique: true },
  pricingSheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingSheet', required: true },
  approvals: [{
    role: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Approved', 'Rejected', 'Revision Requested'], required: true },
    comments: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  }],
  financeApproved: { type: Boolean, default: false },
  executiveApproved: { type: Boolean, default: false },
  finalApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Approval', approvalSchema);
