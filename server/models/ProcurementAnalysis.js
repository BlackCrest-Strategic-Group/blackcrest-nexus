import mongoose from "mongoose";

const ProcurementAnalysisSchema = new mongoose.Schema(
  {
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

export default mongoose.models.ProcurementAnalysis ||
  mongoose.model("ProcurementAnalysis", ProcurementAnalysisSchema);
