import mongoose from 'mongoose';

const dashboardViewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export default mongoose.models.DashboardView || mongoose.model('DashboardView', dashboardViewSchema);
