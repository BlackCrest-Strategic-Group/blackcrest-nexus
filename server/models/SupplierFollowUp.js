import mongoose from 'mongoose';

const supplierFollowUpSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  supplierName: { type: String, required: true, index: true },
  followUpDate: { type: String, default: '' },
  channel: { type: String, default: 'email' },
  status: { type: String, default: 'open' },
  notes: { type: String, default: '' }
}, { timestamps: true });

supplierFollowUpSchema.index({ tenantId: 1, supplierName: 1, createdAt: -1 });

const SupplierFollowUp = mongoose.models.SupplierFollowUp || mongoose.model('SupplierFollowUp', supplierFollowUpSchema);

export default SupplierFollowUp;
