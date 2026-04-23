import mongoose from 'mongoose';

const workflowRunSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  workflowType: { type: String, required: true },
  status: { type: String, enum: ['queued', 'in_progress', 'blocked', 'completed'], default: 'queued' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

workflowRunSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export default mongoose.models.WorkflowRun || mongoose.model('WorkflowRun', workflowRunSchema);
