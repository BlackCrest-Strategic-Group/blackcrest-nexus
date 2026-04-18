import express from "express";
import multer from "multer";
import { parseDocument } from "../services/documentParser.js";
import { authenticateToken } from "../middleware/auth.js";
import Opportunity from "../models/Opportunity.js";
import { analyzeOpportunityText } from "../services/opportunityAnalysisService.js";
import { buildFundingMatch } from "../services/fundingMatchService.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function handleAnalyzeUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, error: "File is too large. Maximum upload size is 10 MB." });
    }

    return res.status(400).json({ success: false, error: err.message || "Invalid upload request." });
  });
}

router.get("/", authenticateToken, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ savedBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ success: true, opportunities });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch saved opportunities." });
  }
});

router.post("/analyze", authenticateToken, handleAnalyzeUpload, async (req, res) => {
  try {
    let text = "";

    if (req.file) {
      text = await parseDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
    } else if (req.body.text) {
      text = String(req.body.text);
    } else {
      return res.status(400).json({ success: false, error: "Provide a file or text for analysis." });
    }

    if (!text || text.trim().length < 40) {
      return res.status(400).json({
        success: false,
        error: "No readable opportunity text was detected. Upload a PDF, DOCX, TXT, or paste text."
      });
    }

    const analysis = analyzeOpportunityText(text, {
      sector: req.body.sector,
      fundingNeedCategory: req.body.fundingNeedCategory,
      timelineMonths: req.body.timelineMonths
    });

    const funding = buildFundingMatch({
      estimatedDealValue: analysis.estimatedValue,
      timelineMonths: analysis.timelineMonths,
      riskLevel: analysis.executionRisk,
      sector: analysis.sector,
      fundingNeedCategory: analysis.fundingNeedCategory
    });

    return res.json({
      success: true,
      fileName: req.file?.originalname || "pasted-text",
      ...analysis,
      ...funding
    });
  } catch (error) {
    const isUnsupportedType = error.message?.startsWith("Unsupported file type:");
    const isDocxDependencyIssue = error.message?.includes("requires the 'mammoth' package");
    const isDocxParseError = error.message?.startsWith("Failed to parse DOCX file:");

    if (isUnsupportedType || isDocxDependencyIssue || isDocxParseError) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: "Failed to analyze opportunity." });
  }
});

router.post("/score", authenticateToken, (req, res) => {
  try {
    const { text, sector, fundingNeedCategory, timelineMonths } = req.body || {};
    if (!text || String(text).trim().length < 40) {
      return res.status(400).json({ success: false, error: "text is required and must be at least 40 characters." });
    }

    const analysis = analyzeOpportunityText(String(text), { sector, fundingNeedCategory, timelineMonths });
    return res.json({
      success: true,
      goNoGoScore: analysis.goNoGoScore,
      complexityLevel: analysis.complexityLevel,
      timelineRisk: analysis.timelineRisk,
      executionRisk: analysis.executionRisk,
      marginPotential: analysis.marginPotential,
      estimatedValue: analysis.estimatedValue
    });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to score opportunity." });
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
        $set: {
          ...opportunity,
          title: opportunity.title || "Uploaded Opportunity",
          agency: opportunity.agency || "N/A",
          cachedAt: new Date()
        },
        $addToSet: { savedBy: req.user.id }
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, opportunity: saved });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to save opportunity." });
  }
});

export default router;
