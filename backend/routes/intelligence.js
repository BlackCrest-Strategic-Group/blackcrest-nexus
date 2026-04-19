import express from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth.js";
import Opportunity from "../models/Opportunity.js";
import IntelligenceProfile from "../models/IntelligenceProfile.js";
import UserPreference from "../models/UserPreference.js";
import OpportunityAlert from "../models/OpportunityAlert.js";
import { ingestOpportunities } from "../services/opportunityIngestionService.js";
import { scoreOpportunityForUser } from "../services/personalizedScoringService.js";
import { extractFarDfarsCompliance } from "../services/complianceExtractionService.js";
import { parseDocument } from "../services/documentParser.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/profile", authenticateToken, async (req, res) => {
  const [profile, preferences] = await Promise.all([
    IntelligenceProfile.findOne({ user: req.user.id }),
    UserPreference.findOne({ user: req.user.id })
  ]);
  res.json({ success: true, profile, preferences });
});

router.post("/onboarding", authenticateToken, async (req, res) => {
  const { profile = {}, preferences = {} } = req.body || {};
  const normalizedProfile = {
    ...profile,
    user: req.user.id,
    capabilityTags: Array.isArray(profile.capabilityTags)
      ? profile.capabilityTags
      : String(profile.capabilityTags || "").split(",").map((v) => v.trim()).filter(Boolean)
  };
  const normalizedPreferences = {
    ...preferences,
    user: req.user.id,
    workToAvoid: Array.isArray(preferences.workToAvoid)
      ? preferences.workToAvoid
      : String(preferences.workToAvoid || "").split(",").map((v) => v.trim()).filter(Boolean)
  };

  const [savedProfile, savedPreferences] = await Promise.all([
    IntelligenceProfile.findOneAndUpdate({ user: req.user.id }, normalizedProfile, { upsert: true, new: true }),
    UserPreference.findOneAndUpdate({ user: req.user.id }, normalizedPreferences, { upsert: true, new: true })
  ]);

  res.json({ success: true, profile: savedProfile, preferences: savedPreferences });
});

router.post("/ingest", authenticateToken, async (req, res) => {
  const result = await ingestOpportunities(req.body || {});
  res.json({ success: true, ...result });
});

router.get("/opportunities", authenticateToken, async (req, res) => {
  const [profile, preferences] = await Promise.all([
    IntelligenceProfile.findOne({ user: req.user.id }),
    UserPreference.findOne({ user: req.user.id })
  ]);

  if (!profile || !preferences) {
    return res.status(400).json({ success: false, error: "Complete onboarding to unlock personalized intelligence." });
  }

  const opportunities = await Opportunity.find({}).sort({ postedDate: -1, createdAt: -1 }).limit(80).lean();

  const enriched = opportunities.map((opportunity) => ({
    ...opportunity,
    scoring: scoreOpportunityForUser(opportunity, profile, preferences)
  }));

  enriched.sort((a, b) => b.scoring.composite - a.scoring.composite);

  const alerts = [];
  for (const item of enriched.slice(0, 20)) {
    const shouldAlert = item.scoring.winProbability > 75 || item.scoring.strategicFit > 78;
    if (!shouldAlert) continue;
    alerts.push(item);
    await OpportunityAlert.findOneAndUpdate(
      { user: req.user.id, opportunity: item._id },
      {
        user: req.user.id,
        opportunity: item._id,
        title: item.title,
        recommendation: item.scoring.recommendation,
        winProbability: item.scoring.winProbability,
        strategicFit: item.scoring.strategicFit,
        reasoning: item.scoring.reasoning
      },
      { upsert: true }
    );
  }

  const storedAlerts = await OpportunityAlert.find({ user: req.user.id, dismissed: false }).sort({ updatedAt: -1 }).limit(10).lean();

  res.json({
    success: true,
    opportunities: enriched,
    alerts: storedAlerts,
    personalizedHeader: {
      highFit: enriched.filter((item) => item.scoring.composite >= 72).length,
      outsideCapacity: enriched.filter((item) => item.scoring.riskFlags.includes("OUTSIDE CAPACITY")).length,
      expansionMatches: enriched.filter((item) => item.scoring.strategicFit >= 80).length
    }
  });
});

router.post("/compliance/analyze", authenticateToken, upload.single("file"), async (req, res) => {
  let text = req.body?.text || "";
  if (req.file) {
    text = await parseDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
  }
  if (!String(text).trim()) return res.status(400).json({ success: false, error: "Provide text or upload a file." });
  const result = extractFarDfarsCompliance(text);
  res.json({ success: true, ...result });
});

export default router;
