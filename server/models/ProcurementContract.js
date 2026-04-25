import mongoose from 'mongoose';

const procurementContractSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contractNumber: { type: String, required: true },
  supplierName: { type: String, required: true },
  category: { type: String, default: '' },
  annualValue: { type: Number, default: 0 },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  status: { type: String, default: 'active' },
  notes: { type: String, default: '' }
}, { timestamps: true });

procurementContractSchema.index({ tenantId: 1, supplierName: 1, endDate: 1 });

const ProcurementContract = mongoose.models.ProcurementContract || mongoose.model('ProcurementContract', procurementContractSchema);

export default ProcurementContract;
