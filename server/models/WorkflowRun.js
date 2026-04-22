import mongoose from 'mongoose';

const workflowRunSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  workflowType: { type: String, required: true },
  status: { type: String, enum: ['queued', 'in_progress', 'blocked', 'completed'], default: 'queued' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.models.WorkflowRun || mongoose.model('WorkflowRun', workflowRunSchema);
