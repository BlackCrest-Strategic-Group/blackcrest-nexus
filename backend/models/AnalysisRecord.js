import mongoose from "mongoose";

const analysisRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", default: null },
    title: { type: String, trim: true, default: "Untitled Opportunity" },
    naicsCode: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "general" },
    contractValue: { type: Number, min: 0, default: 0 },
    estimatedCost: { type: Number, min: 0, default: 0 },
    expectedMarginPct: { type: Number, min: 0, max: 100, default: 0 },
    winProbabilityPct: { type: Number, min: 0, max: 100, default: 0 },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    recommendation: { type: String, enum: ["BID", "NO_BID", "WATCH"], default: "WATCH" },
    supplierRecommendations: [
      {
        supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
        supplierName: { type: String, trim: true, required: true },
        score: { type: Number, min: 0, max: 100, required: true },
      },
    ],
    strategy: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    outcome: { type: String, enum: ["pending", "won", "lost"], default: "pending" },
  },
  { timestamps: true }
);

analysisRecordSchema.index({ userId: 1, naicsCode: 1, createdAt: -1 });
analysisRecordSchema.index({ outcome: 1, category: 1 });

const AnalysisRecord = mongoose.model("AnalysisRecord", analysisRecordSchema);

export default AnalysisRecord;
