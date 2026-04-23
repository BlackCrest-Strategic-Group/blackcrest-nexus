import { Router } from "express";
import { createBillingPortalSession, getBillingStatus, stripeWebhook } from "../controllers/billingController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/webhook", stripeWebhook);
router.get("/status", authRequired, getBillingStatus);
router.post("/portal-session", authRequired, createBillingPortalSession);

export default router;
