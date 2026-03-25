/**
 * CompanyProfile Model
 * Stores a company's capabilities, capacity, and set-aside status for bid evaluation.
 */

import mongoose from "mongoose";

const companyProfileSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    naicsCodes: { type: [String], default: [] },
    setAsideStatus: { type: [String], default: [] },
    capabilities: { type: [String], default: [] },
    monthlyCapacityHours: { type: Number, default: 0 },
    currentUtilization: { type: Number, min: 0, max: 100, default: 0 },
    leanSavingsHours: { type: Number, default: 0 },
    preferredSuppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
    statesServed: { type: [String], default: [] },
    riskTolerance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  },
  { timestamps: true }
);

companyProfileSchema.index({ companyName: 1 });
companyProfileSchema.index({ naicsCodes: 1 });

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema);
export default CompanyProfile;
