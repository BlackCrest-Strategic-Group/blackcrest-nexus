import express from "express";
import multer from "multer";
import { exportBlanketCsv, uploadBlanketPo } from "../controllers/blanketPoController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const allowedExtensions = [".xlsx", ".xls", ".csv"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const name = (file.originalname || "").toLowerCase();
    if (allowedExtensions.some((ext) => name.endsWith(ext))) {
      return cb(null, true);
    }
    return cb(new Error("Only .xlsx, .xls, and .csv files are supported"));
  }
});

router.post(
  "/upload",
  authenticateToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, error: "File is too large. Maximum size is 10MB." });
      }

      return res.status(400).json({ success: false, error: err.message || "Invalid upload request" });
    });
  },
  uploadBlanketPo
);

router.post("/export/csv", authenticateToken, exportBlanketCsv);

export default router;
