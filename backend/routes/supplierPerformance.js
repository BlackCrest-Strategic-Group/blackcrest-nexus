/**
 * Supplier Performance Routes  –  /api/supplierPerformance
 * Truth Serum: delivery performance tracking and supplier scoring.
 */

import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.js";
import {
  ingestPerformanceRecord,
  bulkIngestPerformanceRecords,
  getSupplierTruthScore,
  getTruthSerumReport,
} from "../controllers/supplierPerformanceController.js";

const router = express.Router();

// Limit write operations to 60 requests per minute per IP
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please wait before trying again." },
});

// Limit read operations to 120 requests per minute per IP
const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please wait before trying again." },
});

// POST /api/supplierPerformance — ingest a single performance record
router.post("/", writeLimiter, authenticateToken, ingestPerformanceRecord);

// POST /api/supplierPerformance/bulk — bulk ingest performance records
router.post("/bulk", writeLimiter, authenticateToken, bulkIngestPerformanceRecords);

// GET /api/supplierPerformance/report — full truth serum report
router.get("/report", readLimiter, authenticateToken, getTruthSerumReport);

// GET /api/supplierPerformance/supplier/:supplierId — truth score for a supplier
router.get("/supplier/:supplierId", readLimiter, authenticateToken, getSupplierTruthScore);

export default router;
