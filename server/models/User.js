import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_CATALOG } from '../config/rbac.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  name: { type: String, required: true, trim: true },
  company: { type: String, default: '' },
  role: { type: String, enum: Object.keys(ROLE_CATALOG), default: 'buyer' },
  procurementFocus: { type: String, default: '' },
  categoriesOfInterest: { type: [String], default: [] },
  marketType: { type: String, enum: ['federal', 'commercial', 'mixed'], default: 'mixed' }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
