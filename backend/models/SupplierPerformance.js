import mongoose from "mongoose";

const supplierPerformanceSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    poNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },
    carrier: {
      type: String,
      enum: ["UPS", "FedEx", "USPS", "DHL", "Other"],
      default: "Other",
    },
    promisedDate: {
      type: Date,
      required: true,
    },
    actualDeliveryDate: {
      type: Date,
      required: true,
    },
    erpReceiptDate: {
      type: Date,
      default: null,
    },
    delayDays: {
      type: Number,
      default: 0,
    },
    receiptLagDays: {
      type: Number,
      default: 0,
    },
    onTime: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["manual", "csv", "erp", "carrier_api"],
      default: "manual",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const SupplierPerformance = mongoose.model("SupplierPerformance", supplierPerformanceSchema);
export default SupplierPerformance;
