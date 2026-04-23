import mongoose from 'mongoose';

const supplierAnalysisSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierProfile', required: true },
  categoryName: { type: String, default: '' },
  opportunityName: { type: String, default: '' },
  output: {
    summary: String,
    fitScore: Number,
    strengths: [String],
    risks: [String],
    diversificationValue: String,
    recommendations: [String],
    nextAction: String,
    confidenceScore: Number,
    timestamp: String
  }
}, { timestamps: true });

supplierAnalysisSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

const SupplierAnalysis = mongoose.models.SupplierAnalysis || mongoose.model('SupplierAnalysis', supplierAnalysisSchema);
export default SupplierAnalysis;
