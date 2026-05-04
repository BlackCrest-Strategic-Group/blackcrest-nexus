import mongoose from 'mongoose';

const marketplaceSupplierSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  location: {
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true }
  },
  capabilities: [{ type: String, trim: true }],
  minimumOrderQuantity: { type: Number, default: 1 },
  leadTime: { type: String, default: '2-4 weeks' },
  contactEmail: { type: String, required: true, trim: true, lowercase: true },
  isVerified: { type: Boolean, default: false }
}, { timestamps: { createdAt: true, updatedAt: true } });

marketplaceSupplierSchema.index({ companyName: 'text', description: 'text', category: 'text', 'location.city': 'text' });

export default mongoose.models.MarketplaceSupplier || mongoose.model('MarketplaceSupplier', marketplaceSupplierSchema);
