import mongoose from 'mongoose';

const savingsRecordSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, default: '' },
  supplierName: { type: String, default: '' },
  baselineCost: { type: Number, default: 0 },
  negotiatedCost: { type: Number, default: 0 },
  realizedSavings: { type: Number, default: 0 },
  status: { type: String, default: 'pipeline' },
  realizedDate: { type: String, default: '' },
  owner: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

savingsRecordSchema.index({ tenantId: 1, realizedDate: -1 });

const SavingsRecord = mongoose.models.SavingsRecord || mongoose.model('SavingsRecord', savingsRecordSchema);

export default SavingsRecord;
