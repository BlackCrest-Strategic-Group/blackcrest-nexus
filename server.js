import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import connectDB from "./backend/config/db.js";

// REAL backend routes
import authRouter from "./backend/routes/auth.js";
import mfaRouter from "./backend/routes/mfa.js";
import opportunitiesRouter from "./backend/routes/opportunities.js";
import opportunityIntelligenceRouter from "./backend/routes/opportunityIntelligence.js";
import docsRouter from "./backend/routes/docs.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, "frontend", "dist");

const PORT = process.env.PORT || 3000;

/** Middleware */
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
app.use("/api", apiLimiter);

/** Health */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    db: mongoose.connection.readyState,
  });
});

/** 🔥 REAL ROUTES (this is the fix) */
app.use("/api/auth", authRouter);
app.use("/api/mfa", mfaRouter);
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/opportunity-intelligence", opportunityIntelligenceRouter);

// FIXED docs mounting
app.use("/", docsRouter);

/** Frontend */
app.use(express.static(frontendDistPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

/** Start */
await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
