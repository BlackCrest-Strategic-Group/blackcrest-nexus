import mongoose from "mongoose";

const proposalSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    order: { type: Number, default: 0 }
  },
  { _id: false }
);

const costLineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["labor", "materials", "subcontractors", "travel", "overhead", "other"],
      default: "labor"
    },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  { _id: false }
);

const proposalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    opportunityTitle: { type: String, trim: true, default: "" },
    solicitationNumber: { type: String, trim: true, default: "" },
    agency: { type: String, trim: true, default: "" },
    dueDate: { type: String, trim: true, default: "" },
    naicsCode: { type: String, trim: true, default: "" },
    setAside: { type: String, trim: true, default: "" },
    requirementSummary: { type: String, trim: true, default: "" },
    // Company info snapshot at time of proposal creation
    companyName: { type: String, trim: true, default: "" },
    companyAddress: { type: String, trim: true, default: "" },
    companyPhone: { type: String, trim: true, default: "" },
    companyEmail: { type: String, trim: true, default: "" },
    companyUei: { type: String, trim: true, default: "" },
    companyCage: { type: String, trim: true, default: "" },
    // AI-generated sections
    sections: { type: [proposalSectionSchema], default: [] },
    // Costing
    costLineItems: { type: [costLineItemSchema], default: [] },
    totalCost: { type: Number, default: 0 },
    profitMarginPct: { type: Number, default: 10 },
    totalPrice: { type: Number, default: 0 },
    // Metadata
    status: {
      type: String,
      enum: ["draft", "review", "final", "submitted"],
      default: "draft"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

proposalSchema.index({ createdBy: 1, createdAt: -1 });
proposalSchema.index({ status: 1 });

const Proposal = mongoose.model("Proposal", proposalSchema);
export default Proposal;
