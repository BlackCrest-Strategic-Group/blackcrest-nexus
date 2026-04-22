import mongoose from 'mongoose';

const procurementTaskSchema = new mongoose.Schema({
  workflowRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowRun', index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'doing', 'blocked', 'done'], default: 'todo' },
  dueAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.ProcurementTask || mongoose.model('ProcurementTask', procurementTaskSchema);
