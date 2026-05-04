import mongoose from 'mongoose';

const marketplaceRequestSchema = new mongoose.Schema({
  productNeeded: { type: String, required: true, trim: true },
  quantity: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  urgency: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.models.MarketplaceRequest || mongoose.model('MarketplaceRequest', marketplaceRequestSchema);
