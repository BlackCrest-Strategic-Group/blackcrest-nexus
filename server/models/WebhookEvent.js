import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, enum: ["stripe"] },
    eventId: { type: String, required: true },
    eventType: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["processed", "skipped"], default: "processed" }
  },
  { timestamps: true }
);

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

const WebhookEvent = mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", webhookEventSchema);
export default WebhookEvent;
