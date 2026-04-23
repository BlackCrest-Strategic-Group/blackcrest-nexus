import mongoose from "mongoose";

const ProcurementAnalysisSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ["pdf", "text"],
      required: true,
    },
    filename: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      required: true,
    },
    scores: {
      urgency: { type: Number, required: true, min: 0, max: 100 },
      scope_volatility: { type: Number, required: true, min: 0, max: 100 },
      post_award_risk: { type: Number, required: true, min: 0, max: 100 },
      intelligence_score: { type: Number, required: true, min: 0, max: 100 },
    },
    insights: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      required: true,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

ProcurementAnalysisSchema.index({ tenantId: 1, userId: 1, analyzedAt: -1 });

export default mongoose.models.ProcurementAnalysis ||
  mongoose.model("ProcurementAnalysis", ProcurementAnalysisSchema);
