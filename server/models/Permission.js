import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  description: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Permission || mongoose.model('Permission', permissionSchema);
