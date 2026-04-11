import express from "express";
import multer from "multer";
import { searchOpportunities, normalizeOpportunity } from "../services/samGov.js";
import { calculateBidScore, detectClauses } from "../services/bidScoring.js";
import { parseDocument } from "../services/documentParser.js";
import { authenticateToken } from "../middleware/auth.js";
import Opportunity from "../models/Opportunity.js";
import { audit, getIp, EVENT } from "../services/auditLogger.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function handleAnalyzeUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File is too large. Maximum upload size is 10 MB."
      });
    }

    return res.status(400).json({
      success: false,
      error: err.message || "Invalid upload request."
    });
  });
}

// POST /api/opportunities/search — Search SAM.gov by NAICS / keyword
router.post("/search", authenticateToken, async (req, res) => {
  try {
    const { postedFrom, postedTo, keyword, naics, psc, setAside, noticeType, page, limit } = req.body;

    if (!postedFrom || !postedTo) {
      return res.status(400).json({ success: false, error: "postedFrom and postedTo are required." });
    }

    const data = await searchOpportunities({
      postedFrom,
      postedTo,
      keyword,
      naics,
      psc,
      setAside,
      noticeType,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 100
    });

    const opportunities = Array.isArray(data.opportunitiesData)
      ? data.opportunitiesData.map(normalizeOpportunity)
      : [];

    return res.json({
      success: true,
      totalRecords: data.totalRecords ?? opportunities.length,
      page: page ? Number(page) : 1,
      opportunities
    });
  } catch (error) {
    console.error("SAM search error:", error.message);
    const isSamInvalidJson = typeof error?.message === "string" && error.message.includes("SAM returned invalid JSON");
    if (isSamInvalidJson) {
      return res.status(502).json({
        success: false,
        errorCode: "SAM_BAD_RESPONSE",
        error: process.env.NODE_ENV === "production"
          ? "SAM.gov returned an unexpected response. Please verify your API key permissions and try again."
          : error.message
      });
    }
    return res.status(error?.code === "MISSING_API_KEY" ? 400 : 500).json({
      success: false,
      errorCode: error?.code || null,
      error: error?.message || "Failed to fetch opportunities."
    });
  }
});

router.get("/debug", authenticateToken, async (req, res) => {
  const configuredSamKey =
    process.env.SAM_API_KEY ||
    process.env.SAM_GOV_API_KEY ||
    process.env.SAMGOV_API_KEY;

  if (!configuredSamKey || !String(configuredSamKey).trim()) {
    return res.status(400).json({
      success: false,
      errorCode: "MISSING_API_KEY",
      error:
        "SAM API key is missing. Set SAM_API_KEY (or SAM_GOV_API_KEY) in your service environment and redeploy."
    });
  }

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const fmt = d =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
      d.getDate()
    ).padStart(2, "0")}/${d.getFullYear()}`;

  try {
    const data = await searchOpportunities({
      postedFrom: fmt(weekAgo),
      postedTo: fmt(today),
      limit: 1
    });
    return res.json({
      success: true,
      message: "SAM API connectivity confirmed.",
      totalRecords: data.totalRecords ?? null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "SAM connectivity check failed."
    });
  }
});

    const clauses = detectClauses(text);
    const scoreData = calculateBidScore(text);

    audit(EVENT.ANALYSIS_RUN, {
      userId: req.user.id,
      ip: req.clientIp ?? getIp(req),
      route: req.originalUrl,
      method: req.method,
      success: true,
      durationMs: Date.now() - startTime,
      details: {
        source: req.file ? "file_upload" : "pasted_text",
        fileName: req.file?.originalname ?? null,
        clausesFound: clauses.length,
        bidScore: scoreData?.score ?? null
      }
    });

    return res.json({
      success: true,
      fileName: req.file?.originalname || "pasted-text",
      extractedTextPreview: text.slice(0, 3000),
      clausesDetected: clauses,
      ...scoreData,
      disclaimer: "Designed for Non-Classified Use Only"
    });
  } catch (error) {
    console.error("Document analysis error:", error.message);
    audit(EVENT.ANALYSIS_RUN, {
      userId: req.user.id,
      ip: req.clientIp ?? getIp(req),
      route: req.originalUrl,
      method: req.method,
      success: false,
      durationMs: Date.now() - startTime,
      details: { error: error.message }
    });

    const isUnsupportedType = error.message?.startsWith("Unsupported file type:");
    const isDocxDependencyIssue = error.message?.includes("requires the 'mammoth' package");
    const isDocxParseError = error.message?.startsWith("Failed to parse DOCX file:");

    if (isUnsupportedType || isDocxDependencyIssue || isDocxParseError) {
      const productionMessage = isUnsupportedType
        ? "Unsupported file type. Upload a PDF or TXT file."
        : "DOCX uploads are currently unavailable in production. Please upload PDF or TXT.";

      return res.status(400).json({
        success: false,
        error: process.env.NODE_ENV === "production" ? productionMessage : error.message
      });
    }

    return res.status(500).json({ success: false, error: "Failed to analyze document." });
    const userInputError =
      error.message?.startsWith("Unsupported file type:") ||
      error.message?.includes("requires the 'mammoth' package") ||
      error.message?.startsWith("Failed to parse DOCX file:");

    if (userInputError) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(500).json({ success: false, error: "Failed to analyze document." });
  }
});

router.post("/save", authenticateToken, async (req, res) => {
  try {
    const { opportunity } = req.body;
    if (!opportunity || !opportunity.noticeId) {
      return res.status(400).json({ success: false, error: "Valid opportunity data is required." });
    }

    const saved = await Opportunity.findOneAndUpdate(
      { noticeId: opportunity.noticeId },
      {
        $set: { ...opportunity, cachedAt: new Date() },
        $addToSet: { savedBy: req.user.id }
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, opportunity: saved });
  } catch (error) {
    console.error("Save opportunity error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to save opportunity." });
  }
});

router.get("/debug", authenticateToken, async (req, res) => {
  const configuredSamKey = process.env.SAM_API_KEY || process.env.SAM_GOV_API_KEY || process.env.SAMGOV_API_KEY;

  if (
    !(
      (typeof process.env.SAM_API_KEY === "string" && process.env.SAM_API_KEY.trim()) ||
      (typeof process.env.SAM_GOV_API_KEY === "string" && process.env.SAM_GOV_API_KEY.trim()) ||
      (typeof process.env.SAMGOV_API_KEY === "string" && process.env.SAMGOV_API_KEY.trim())
    )
  ) {
  const samKeyForDebug = process.env.SAM_API_KEY || process.env.SAM_GOV_API_KEY || process.env.SAMGOV_API_KEY;
  if (!samKeyForDebug || !String(samKeyForDebug).trim()) {
  const configuredSamKey = process.env.SAM_API_KEY || process.env.SAM_GOV_API_KEY || process.env.SAMGOV_API_KEY;
  const configuredSamKey =
    process.env.SAM_API_KEY || process.env.SAM_GOV_API_KEY || process.env.SAMGOV_API_KEY;
  if (!configuredSamKey || !String(configuredSamKey).trim()) {
    return res.status(400).json({
      success: false,
      errorCode: "MISSING_API_KEY",
      error: "SAM API key is missing. Set SAM_API_KEY (or SAM_GOV_API_KEY) in your service environment and redeploy."
    });
  }

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const fmt = (d) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;

  try {
    const data = await searchOpportunities({ postedFrom: fmt(weekAgo), postedTo: fmt(today), limit: 1 });
    return res.json({ success: true, message: "SAM API connectivity confirmed.", totalRecords: data.totalRecords ?? null });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || "SAM connectivity check failed." });
  }
});

export default router;
