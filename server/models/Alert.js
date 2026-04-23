import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  roleGroup: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  message: { type: String, required: true },
  source: { type: String, default: 'sentinel' },
  acknowledgedAt: { type: Date, default: null }
}, { timestamps: true });

alertSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema);
