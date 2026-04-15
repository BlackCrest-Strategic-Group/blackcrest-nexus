import express from "express";
import multer from "multer";
import { uploadBlanketPo } from "../controllers/blanketPoController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post("/upload", authenticateToken, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, error: "File is too large. Maximum size is 5MB." });
    }

    return res.status(400).json({ success: false, error: err.message || "Invalid upload request" });
  });
}, uploadBlanketPo);

export default router;
