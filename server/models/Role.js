import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  group: { type: String, required: true },
  permissions: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model('Role', roleSchema);
