import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    noticeId: { type: String, required: true, unique: true },
    title: { type: String, default: null },
    solicitationNumber: { type: String, default: null },
    agency: { type: String, default: null },
    subTier: { type: String, default: null },
    office: { type: String, default: null },
    postedDate: { type: String, default: null },
    responseDeadLine: { type: String, default: null },
    naicsCode: { type: String, default: null },
    pscCode: { type: String, default: null },
    setAside: { type: String, default: null },
    noticeType: { type: String, default: null },
    contractType: { type: String, default: null },
    description: { type: String, default: "" },
    estimatedValue: { type: Number, default: 0 },
    placeOfPerformance: { type: mongoose.Schema.Types.Mixed, default: null },
    uiLink: { type: String, default: null },
    source: { type: String, enum: ["sam-gov", "seed", "manual"], default: "sam-gov" },
    ingestBatchAt: { type: Date, default: Date.now },

    bidScore: { type: Number, default: null },
    recommendation: { type: String, default: null },
    analysisFlags: { type: [String], default: [] },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    cachedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

opportunitySchema.index({ naicsCode: 1, postedDate: -1 });
opportunitySchema.index({ agency: 1, postedDate: -1 });
opportunitySchema.index({ ingestBatchAt: -1 });

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

export default Opportunity;
