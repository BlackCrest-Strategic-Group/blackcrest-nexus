import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  roleGroup: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  message: { type: String, required: true },
  source: { type: String, default: 'sentinel' },
  acknowledgedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema);
