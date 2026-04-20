import mongoose from 'mongoose';

const actionItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  sourceType: { type: String, enum: ['category', 'supplier', 'opportunity', 'system'], default: 'system' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'done'], default: 'open' },
  dueDate: { type: Date, default: null }
}, { timestamps: true });

const ActionItem = mongoose.models.ActionItem || mongoose.model('ActionItem', actionItemSchema);
export default ActionItem;
