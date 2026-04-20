import mongoose from 'mongoose';

const opportunityAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  linkedCategorySnapshotId: { type: mongoose.Schema.Types.ObjectId, ref: 'CategorySnapshot', default: null },
  linkedSupplierIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SupplierProfile' }],
  output: {
    summary: String,
    requirements: [String],
    complianceFlags: [String],
    risks: [String],
    effortEstimate: String,
    bidRecommendation: String,
    implications: [String],
    nextSteps: [String],
    recommendations: [String],
    confidenceScore: Number,
    timestamp: String
  }
}, { timestamps: true });

const OpportunityAnalysis = mongoose.models.OpportunityAnalysis || mongoose.model('OpportunityAnalysis', opportunityAnalysisSchema);
export default OpportunityAnalysis;
