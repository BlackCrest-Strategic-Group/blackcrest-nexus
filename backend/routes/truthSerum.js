import express from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth.js";
import { parseDocument } from "../services/documentParser.js";
import { analyzeTruthSerumInput } from "../services/truthSerumDecisionEngine.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function handleUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, error: "File is too large. Maximum upload size is 10 MB." });
    }
    return res.status(400).json({ success: false, error: err.message || "Invalid upload request." });
  });
}

function getAnalysisMode(body) {
  const mode = String(body?.analysisMode || "federal").toLowerCase();
  return ["federal", "commercial", "hybrid"].includes(mode) ? mode : "federal";
}

router.post("/analyze", authenticateToken, handleUpload, async (req, res) => {
  try {
    if (!req.file && !req.body?.text) {
      return res.status(400).json({ success: false, error: "Provide a file or text for analysis." });
    }

    const text = req.file
      ? await parseDocument(req.file.buffer, req.file.mimetype, req.file.originalname)
      : String(req.body.text || "");

    if (!text.trim() || text.trim().length < 40) {
      return res.status(400).json({
        success: false,
        error: "No readable opportunity text detected. Upload a PDF, DOCX, TXT, or paste text."
      });
    }

    const result = await analyzeTruthSerumInput({
      text,
      source: req.file ? "file" : "text",
      metadata: {
        fileName: req.file?.originalname || "pasted-text",
        analysisMode: getAnalysisMode(req.body)
      }
    });

    return res.json({
      success: true,
      fileName: req.file?.originalname || "pasted-text",
      analysisMode: getAnalysisMode(req.body),
      ...result
    });
  } catch (error) {
    if (error.message?.startsWith("Unsupported file type:") || error.message?.startsWith("Failed to parse DOCX")) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: "Truth Serum analysis failed." });
  }
});

router.post("/analyze-text", authenticateToken, async (req, res) => {
  try {
    const text = String(req.body?.text || "");
    if (text.trim().length < 40) {
      return res.status(400).json({ success: false, error: "text must be at least 40 characters." });
    }

    const result = await analyzeTruthSerumInput({
      text,
      source: "text",
      metadata: { analysisMode: getAnalysisMode(req.body) }
    });

    return res.json({ success: true, analysisMode: getAnalysisMode(req.body), ...result });
  } catch {
    return res.status(500).json({ success: false, error: "Truth Serum text analysis failed." });
  }
});

export default router;
