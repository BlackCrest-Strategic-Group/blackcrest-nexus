import mongoose from "mongoose";

const opportunityAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", required: true },
    title: { type: String, required: true },
    recommendation: { type: String, enum: ["PURSUE", "PARTNER", "IGNORE"], required: true },
    winProbability: { type: Number, required: true },
    strategicFit: { type: Number, required: true },
    reasoning: { type: String, default: "" },
    dismissed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

opportunityAlertSchema.index({ user: 1, opportunity: 1 }, { unique: true });

export default mongoose.model("OpportunityAlert", opportunityAlertSchema);
