import mongoose from 'mongoose';

const aiBriefingSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  roleGroup: { type: String, required: true },
  summary: { type: String, required: true },
  recommendations: { type: [String], default: [] }
}, { timestamps: true });

aiBriefingSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export default mongoose.models.AIBriefing || mongoose.model('AIBriefing', aiBriefingSchema);
