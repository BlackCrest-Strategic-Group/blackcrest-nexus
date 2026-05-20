import mongoose from 'mongoose';

const quickBooksConfigSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  realmId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  tokenExpiresAt: { type: Date, required: true },
}, { timestamps: true });

const QuickBooksConfig = mongoose.models.QuickBooksConfig
  || mongoose.model('QuickBooksConfig', quickBooksConfigSchema);

export default QuickBooksConfig;
