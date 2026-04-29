import mongoose from "mongoose";

const kpiSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["delivery", "quality", "cost", "responsiveness", "compliance"],
      required: true
    },
    score: { type: Number, min: 0, max: 100, required: true },
    notes: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cage: { type: String, trim: true, default: "" },
    dunsUei: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    headquarters: { type: String, trim: true, default: "" },
    supplierType: {
      type: String,
      enum: ["manufacturer", "distributor", "service_provider", "consulting", "logistics"],
      default: "manufacturer"
    },
    categories: { type: [String], default: [] },
    indirectSpendCategories: { type: [String], default: [] },
    regionsServed: { type: [String], default: [] },
    industriesServed: { type: [String], default: [] },
    capabilities: { type: [String], default: [] },
    naicsCodes: { type: [String], default: [] },
    contactName: { type: String, trim: true, default: "" },
    contactEmail: { type: String, trim: true, lowercase: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    tier: {
      type: String,
      enum: ["prime", "sub", "small_business", "socioeconomic"],
      default: "sub"
    },
    status: {
      type: String,
      enum: ["active", "inactive", "probation", "blacklisted"],
      default: "active"
    },
    verifiedSupplier: {
      type: Boolean,
      default: false
    },
    averageLeadTimeDays: {
      type: Number,
      default: 0
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    kpis: { type: [kpiSchema], default: [] },
    overallScore: { type: Number, min: 0, max: 100, default: null },
    certifications: { type: [String], default: [] },
    pastPerformanceRating: {
      type: String,
      enum: ["exceptional", "very_good", "satisfactory", "marginal", "unsatisfactory", ""],
      default: ""
    },
    activeContracts: { type: Number, default: 0 },
    totalContractValue: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

supplierSchema.pre("save", function (next) {
  if (this.kpis && this.kpis.length > 0) {
    const total = this.kpis.reduce((sum, k) => sum + k.score, 0);
    this.overallScore = Math.round(total / this.kpis.length);
  }
  next();
});

supplierSchema.index({ name: "text", cage: 1, dunsUei: 1 });
supplierSchema.index({ naicsCodes: 1 });
supplierSchema.index({ categories: 1 });
supplierSchema.index({ indirectSpendCategories: 1 });
supplierSchema.index({ overallScore: -1 });

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
