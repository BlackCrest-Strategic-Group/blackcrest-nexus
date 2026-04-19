import mongoose from "mongoose";

const intelligenceProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, default: "", trim: true },
    naicsCodes: { type: [String], default: [] },
    capabilitiesText: { type: String, default: "" },
    capabilityTags: { type: [String], default: [] },
    pastPerformance: { type: String, default: "" },
    revenueRange: { type: String, default: "" },
    teamSize: { type: Number, default: 0 },
    capacityIndicators: {
      maxContractSize: { type: Number, default: 0 },
      staffingCapacity: { type: Number, default: 0 },
      deliveryComplexityTolerance: { type: String, enum: ["low", "medium", "high"], default: "medium" }
    },
    certifications: { type: [String], default: [] },
    setAsideStatus: { type: [String], default: [] },
    targetAgencies: { type: [String], default: [] },
    targetIndustries: { type: [String], default: [] },
    preferredContractTypes: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("IntelligenceProfile", intelligenceProfileSchema);
