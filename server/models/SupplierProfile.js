import mongoose from 'mongoose';

const supplierProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, default: '' },
  capabilities: { type: [String], default: [] },
  notes: { type: String, default: '' },
  risks: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  relationshipScore: { type: Number, default: 50 }
}, { timestamps: true });

const SupplierProfile = mongoose.models.SupplierProfile || mongoose.model('SupplierProfile', supplierProfileSchema);
export default SupplierProfile;
