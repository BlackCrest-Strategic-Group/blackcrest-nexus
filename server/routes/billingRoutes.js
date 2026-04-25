import { Router } from "express";
import { createBillingPortalSession, getBillingStatus, getCommercialProof, getPlanCatalog, getWeeklyReliabilityRoi, stripeWebhook } from "../controllers/billingController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/webhook", stripeWebhook);
router.get("/plans", getPlanCatalog);
router.get("/status", authRequired, getBillingStatus);
router.post("/portal-session", authRequired, createBillingPortalSession);
router.get("/commercial-proof", authRequired, getCommercialProof);
router.get("/weekly-reliability-roi", authRequired, getWeeklyReliabilityRoi);

export default router;
