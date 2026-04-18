import mongoose from "mongoose";

const fundingLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    requestedHelp: { type: String, default: "", trim: true },
    opportunitySummary: { type: String, default: "", trim: true },
    matchedLenders: [{ type: String }],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

const FundingLead = mongoose.model("FundingLead", fundingLeadSchema);

export default FundingLead;
