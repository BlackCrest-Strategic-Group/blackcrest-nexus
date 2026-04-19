import ProcurementAnalysis from "../models/ProcurementAnalysis.js";
import { parsePdfBuffer, normalizeInputText } from "../services/pdfService.js";
import { analyzeProcurementRisk } from "../services/aiService.js";

function computeIntelligenceScore(scores) {
  const weightedRisk = (scores.urgency * 0.3) + (scores.scope_volatility * 0.35) + (scores.post_award_risk * 0.35);
  return Math.max(0, Math.min(100, Math.round(100 - weightedRisk + 20)));
}

export async function analyzeRfp(req, res, next) {
  try {
    const textInput = req.body?.text || "";
    const file = req.file;

    if (!textInput && !file) {
      return res.status(400).json({ error: "Provide an RFP PDF file or plain text content." });
    }

    let sourceType = "text";
    let filename = null;
    let content = normalizeInputText(textInput);

    if (file) {
      sourceType = "pdf";
      filename = file.originalname;
      content = await parsePdfBuffer(file.buffer);
    }

    if (!content) {
      return res.status(400).json({ error: "No analyzable content found in the provided input." });
    }

    const analysis = await analyzeProcurementRisk(content);
    const intelligenceScore = computeIntelligenceScore(analysis.scores);

    const payload = {
      ...analysis,
      scores: {
        ...analysis.scores,
        intelligence_score: intelligenceScore,
      },
    };

    try {
      await ProcurementAnalysis.create({
        sourceType,
        filename,
        summary: payload.summary,
        scores: payload.scores,
        insights: payload.insights,
        recommendation: payload.recommendation,
      });
    } catch (error) {
      console.warn("Analysis history not saved:", error.message);
    }

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}

export async function getAnalysisHistory(req, res, next) {
  try {
    const entries = await ProcurementAnalysis.find({})
      .sort({ analyzedAt: -1 })
      .limit(15)
      .lean();

    res.status(200).json({ history: entries });
  } catch (error) {
    if (error.name === "MongooseServerSelectionError") {
      return res.status(200).json({ history: [] });
    }
    next(error);
  }
}
