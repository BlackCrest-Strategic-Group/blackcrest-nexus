import mongoose from 'mongoose';

const aiBriefingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  roleGroup: { type: String, required: true },
  summary: { type: String, required: true },
  recommendations: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.models.AIBriefing || mongoose.model('AIBriefing', aiBriefingSchema);
