import path from "path";
import express from "express";
import multer from "multer";
import { uploadBlanketPo } from "../controllers/blanketPoController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const allowedExtensions = new Set([".xlsx", ".xls", ".csv"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();

    if (allowedExtensions.has(extension)) {
      cb(null, true);
      return;
    }

    cb(new Error("Unsupported file type. Allowed file types: .xlsx, .xls, .csv"));
  }
});

router.post(
  "/upload",
  authenticateToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, error: "File is too large. Maximum size is 5MB." });
      }

      return res.status(400).json({ success: false, error: err.message || "Invalid upload request" });
    });
  },
  uploadBlanketPo
);

export default router;
