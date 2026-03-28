import "./tracer.js";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import rateLimit from "express-rate-limit";
import { connectDB } from "./backend/config/db.js";

// Backend route handlers
import authRoutes from "./backend/routes/auth.js";
import opportunitiesRoutes from "./backend/routes/opportunities.js";
import emailRoutes from "./backend/routes/email.js";
import adminRoutes from "./backend/routes/admin.js";
import docsRoutes from "./backend/routes/docs.js";
import erpRoutes from "./backend/routes/erp.js";
import workflowsRoutes from "./backend/routes/workflows.js";
import suppliersRoutes from "./backend/routes/suppliers.js";
import marginsRoutes from "./backend/routes/margins.js";
import capacityRoutes from "./backend/routes/capacity.js";
import dashboardRoutes from "./backend/routes/dashboard.js";
import opportunityIntelligenceRoutes from "./backend/routes/opportunityIntelligence.js";
import mobileRoutes from "./backend/routes/mobile.js";
import opportunityEvaluateRoutes from "./backend/routes/opportunityEvaluate.js";
import findSuppliersRoutes from "./backend/routes/findSuppliers.js";
import mfaRoutes from "./backend/routes/mfa.js";
import { startDigestScheduler } from "./backend/services/digestScheduler.js";
import { seedDemoUser } from "./backend/scripts/seedDemoUser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Startup validation
// ---------------------------------------------------------------------------
console.log("[Server] Starting up...");
console.log("[Server] NODE_ENV:", process.env.NODE_ENV);
console.log("[Server] MONGODB_URI:", process.env.MONGODB_URI ? "✓ set" : "✗ MISSING");
console.log("[Server] JWT_SECRET:", process.env.JWT_SECRET ? "✓ set" : "✗ MISSING");

if (!process.env.MONGODB_URI) {
  console.error("[FATAL] MONGODB_URI is not set. Exiting.");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("[FATAL] JWT_SECRET is not set. Exiting.");
  process.exit(1);
}

const app = express();

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));

// ---------------------------------------------------------------------------
// API routes  (must come before static/SPA middleware)
// ---------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/mfa", mfaRoutes);
app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api/email-preferences", emailRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/erp", erpRoutes);
app.use("/api/workflows", workflowsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/margins", marginsRoutes);
app.use("/api/capacity", capacityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/opportunity-intelligence", opportunityIntelligenceRoutes);
app.use("/api/mobile", mobileRoutes);
app.use("/api/opportunity", opportunityEvaluateRoutes);
app.use("/api/find-suppliers", findSuppliersRoutes);
app.use("/", docsRoutes);

// ---------------------------------------------------------------------------
// Static assets from public/ (login.html, styles.css, etc.)
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------------------------------
// Serve built React app
// ---------------------------------------------------------------------------
const distDir = path.join(__dirname, "frontend", "dist");
const distExists = fs.existsSync(distDir);
console.log("[Server] Frontend dist directory exists:", distExists ? "✓ yes" : "✗ no");

if (distExists) {
  app.use(express.static(distDir));
}

// ---------------------------------------------------------------------------
// SPA catch-all: serve index.html for any non-API route so React Router works
// ---------------------------------------------------------------------------
const spaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("*", spaLimiter, (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  
  const indexPath = path.join(distDir, "index.html");
  
  // Check if React build exists
  if (!fs.existsSync(indexPath)) {
    console.warn("[Server] React build not found at", indexPath, "- serving fallback login.html");
    return res.sendFile(path.join(__dirname, "public", "login.html"), (err) => {
      if (err) {
        console.error("[Server] Error serving login.html:", err.message);
        res.status(500).json({ success: false, error: "Internal server error." });
      }
    });
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.warn("[Server] Error serving index.html:", err.message);
      res.sendFile(path.join(__dirname, "public", "login.html"));
    }
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
    return res.status(409).json({ success: false, error: `Duplicate value for ${field}.` });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, error: err.message });
  }
  console.error("[Error]", err.message);
  res.status(500).json({ success: false, error: "Internal server error." });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    await seedDemoUser();
    startDigestScheduler();

    app.listen(PORT, () => {
      console.log(`[Server] Listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
    });
  })
  .catch((err) => {
    console.error("[FATAL] Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
