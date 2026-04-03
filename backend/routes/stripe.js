/**
 * Stripe subscription routes
 *
 * POST /api/stripe/create-checkout-session  — create a Stripe Checkout session
 * POST /api/stripe/webhook                  — handle Stripe webhook events
 * GET  /api/stripe/subscription             — get current user subscription status
 * POST /api/stripe/portal                   — create a Stripe Customer Portal session
 */

import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

// Map plan names to Stripe price IDs (set via environment variables)
const PRICE_IDS = {
  pro:        process.env.STRIPE_PRICE_PRO        || null, // $349/mo
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || null, // $595/mo
};

// ─── POST /api/stripe/create-checkout-session ────────────────────────────────
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["pro", "enterprise"].includes(plan)) {
      return res.status(400).json({ success: false, error: "Invalid plan. Choose pro or enterprise." });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return res.status(503).json({ success: false, error: "Stripe pricing not configured for this environment." });
    }

    const stripe = getStripe();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name:  user.name || undefined,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const appUrl = process.env.APP_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // 30-day free trial applied at the subscription level
      subscription_data: {
        trial_period_days: 30,
        metadata: { userId: user._id.toString(), plan }
      },
      success_url: `${appUrl}/dashboard?checkout=success&plan=${plan}`,
      cancel_url:  `${appUrl}/?checkout=canceled`,
      allow_promotion_codes: true,
      customer_update: { address: "auto" },
      billing_address_collection: "auto"
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ success: false, error: "Failed to create checkout session." });
  }
});

// ─── POST /api/stripe/webhook ────────────────────────────────────────────────
// NOTE: This route receives the raw body (set in server.js before json middleware)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("[Stripe webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
  }

  let event;
  try {
    if (webhookSecret && sig) {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Development fallback: parse body directly
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error("[Stripe webhook] Invalid signature:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error("[Stripe webhook] Handler error:", err.message);
    return res.status(500).send("Handler error");
  }

  res.json({ received: true });
});

async function handleStripeEvent(event) {
  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription") break;
      await applySubscriptionFromSession(stripe, session);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      await syncSubscription(stripe, sub);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await cancelSubscription(sub);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await User.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { planStatus: "past_due" }
        );
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await User.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { planStatus: "active" }
        );
      }
      break;
    }

    default:
      break;
  }
}

async function applySubscriptionFromSession(stripe, session) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!subscriptionId) return;

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = sub.metadata?.plan || resolvePlanFromPriceId(sub.items.data[0]?.price?.id);
  const status = mapStripeStatus(sub.status);

  await User.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      plan,
      planStatus: status,
      stripeSubscriptionId: subscriptionId
    }
  );
}

async function syncSubscription(stripe, sub) {
  const plan = sub.metadata?.plan || resolvePlanFromPriceId(sub.items.data[0]?.price?.id);
  const status = mapStripeStatus(sub.status);

  await User.findOneAndUpdate(
    { stripeSubscriptionId: sub.id },
    { plan, planStatus: status }
  );
}

async function cancelSubscription(sub) {
  await User.findOneAndUpdate(
    { stripeSubscriptionId: sub.id },
    { plan: "free", planStatus: "canceled", stripeSubscriptionId: null }
  );
}

function resolvePlanFromPriceId(priceId) {
  if (priceId === PRICE_IDS.enterprise) return "enterprise";
  if (priceId === PRICE_IDS.pro) return "pro";
  return "free";
}

function mapStripeStatus(stripeStatus) {
  const map = {
    trialing:     "trialing",
    active:       "active",
    past_due:     "past_due",
    unpaid:       "unpaid",
    canceled:     "canceled",
    incomplete:   "past_due",
    incomplete_expired: "canceled"
  };
  return map[stripeStatus] || "active";
}

// ─── GET /api/stripe/subscription ───────────────────────────────────────────
router.get("/subscription", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "plan planStatus trialEndsAt stripeCustomerId stripeSubscriptionId"
    );
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    res.json({
      success: true,
      plan: user.plan,
      planStatus: user.planStatus,
      trialEndsAt: user.trialEndsAt,
      hasStripe: !!user.stripeSubscriptionId
    });
  } catch (err) {
    console.error("Subscription status error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch subscription." });
  }
});

// ─── POST /api/stripe/portal ─────────────────────────────────────────────────
router.post("/portal", authenticateToken, async (req, res) => {
  try {
    const stripe = getStripe();
    const user = await User.findById(req.user.id).select("stripeCustomerId");
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ success: false, error: "No billing account found." });
    }

    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/dashboard`
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err.message);
    res.status(500).json({ success: false, error: "Failed to create billing portal session." });
  }
});

export default router;
