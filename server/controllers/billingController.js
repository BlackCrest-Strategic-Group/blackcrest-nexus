import Stripe from "stripe";
import Tenant from "../models/Tenant.js";
import WebhookEvent from "../models/WebhookEvent.js";
import { getPlanCatalogArray } from "../config/pricingCatalog.js";
import { getCommercialProofSnapshot } from "../services/commercialProofService.js";
import { buildWeeklyReliabilityAndRoiReport } from "../services/weeklyOpsReportService.js";


export async function getPlanCatalog(_req, res) {
  return res.json({ plans: getPlanCatalogArray() });
}

export async function getCommercialProof(_req, res) {
  const snapshot = await getCommercialProofSnapshot({ now: new Date() });
  return res.json(snapshot);
}

export async function getWeeklyReliabilityRoi(_req, res) {
  const report = await buildWeeklyReliabilityAndRoiReport({ now: new Date() });
  return res.json(report);
}

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function getBillingStatus(req, res) {
  const tenantId = req.user?.tenant?._id;
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  return res.json({
    tenantId: tenant._id,
    plan: tenant.plan,
    subscriptionStatus: tenant.subscriptionStatus,
    trialEndsAt: tenant.trialEndsAt,
    seats: tenant.seats
  });
}

export async function createBillingPortalSession(req, res) {
  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(501).json({ message: "Stripe not configured. Set STRIPE_SECRET_KEY." });
  }

  const tenantId = req.user?.tenant?._id;
  const tenant = await Tenant.findById(tenantId);
  if (!tenant?.stripeCustomerId) {
    return res.status(400).json({ message: "Stripe customer is not configured for this tenant" });
  }

  const returnUrl = req.body?.returnUrl || process.env.BILLING_RETURN_URL || "http://localhost:3000/settings";
  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: returnUrl
  });

  return res.json({ url: session.url });
}

export async function stripeWebhook(req, res) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(501).json({ message: "Stripe webhook is not configured" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const alreadyProcessed = await WebhookEvent.findOne({ provider: "stripe", eventId: event.id }).lean();
    if (alreadyProcessed) {
      return res.json({ received: true, deduplicated: true });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const subscription = event.data.object;
      await Tenant.findOneAndUpdate(
        { stripeCustomerId: subscription.customer },
        {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status === "trialing" ? "trialing" : (subscription.status === "active" ? "active" : "past_due")
        }
      );
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await Tenant.findOneAndUpdate(
        { stripeCustomerId: subscription.customer },
        { subscriptionStatus: "canceled" }
      );
    }

    await WebhookEvent.create({
      provider: "stripe",
      eventId: event.id,
      eventType: event.type,
      status: "processed"
    });

    return res.json({ received: true });
  } catch (error) {
    return res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
}
