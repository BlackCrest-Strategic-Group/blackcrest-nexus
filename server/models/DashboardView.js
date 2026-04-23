import mongoose from 'mongoose';

const dashboardViewSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

dashboardViewSchema.index({ tenantId: 1, userId: 1, updatedAt: -1 });

export default mongoose.models.DashboardView || mongoose.model('DashboardView', dashboardViewSchema);
