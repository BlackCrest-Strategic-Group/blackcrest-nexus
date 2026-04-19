import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    riskTolerance: { type: String, enum: ["safe", "balanced", "aggressive"], default: "balanced" },
    marginPreference: { type: String, enum: ["low", "balanced", "high"], default: "balanced" },
    preferredContractSize: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    willingnessToPartner: { type: Boolean, default: true },
    growthGoal: { type: String, enum: ["revenue", "expansion", "pipeline", "margin"], default: "pipeline" },
    workToAvoid: { type: [String], default: [] },
    agenciesOfInterest: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("UserPreference", userPreferenceSchema);
