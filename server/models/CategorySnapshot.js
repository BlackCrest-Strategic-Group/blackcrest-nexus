import mongoose from 'mongoose';

const categorySnapshotSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  categoryName: { type: String, required: true },
  product: { type: String, required: true },
  geography: { type: String, default: '' },
  notes: { type: String, default: '' },
  output: {
    summary: String,
    signals: [String],
    risks: [String],
    demandSupplyTrend: String,
    procurementStance: String,
    supplierOutreachStrategy: String,
    recommendations: [String],
    confidenceScore: Number,
    timestamp: String
  }
}, { timestamps: true });

categorySnapshotSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

const CategorySnapshot = mongoose.models.CategorySnapshot || mongoose.model('CategorySnapshot', categorySnapshotSchema);
export default CategorySnapshot;
