import express from "express";
import multer from "multer";
import { analyzeRfp, getAnalysisHistory } from "../controllers/analyzeRfpController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are supported for file upload."));
      return;
    }
    cb(null, true);
  },
});

router.post("/", upload.single("rfp"), analyzeRfp);
router.get("/history", getAnalysisHistory);

export default router;
