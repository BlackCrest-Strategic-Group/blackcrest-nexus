import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, "frontend", "dist");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Basic middleware
 */
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * Basic rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

/**
 * Health check routes
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * API routes
 * Make sure these files actually exist and export a default router.
 * If your filenames are different, change the import paths.
 */
try {
  const opportunitiesModule = await import("./routes/opportunities.js");
  app.use("/api/opportunities", opportunitiesModule.default);
  console.log("Loaded /api/opportunities");
} catch (error) {
  console.warn("Could not load ./routes/opportunities.js");
}

try {
  const capitalModule = await import("./routes/capital.js");
  app.use("/api/capital", capitalModule.default);
  console.log("Loaded /api/capital");
} catch (error) {
  console.warn("Could not load ./routes/capital.js");
}

try {
  const authModule = await import("./routes/auth.js");
  app.use("/api/auth", authModule.default);
  console.log("Loaded /api/auth");
} catch (error) {
  console.warn("Could not load ./routes/auth.js");
}

try {
  const docsModule = await import("./routes/docs.js");
  app.use("/api-docs", docsModule.default);
  console.log("Loaded /api-docs");
} catch (error) {
  console.warn("Could not load ./routes/docs.js");
}

/**
 * Serve Vite frontend build
 */
app.use(express.static(frontendDistPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

/**
 * React/Vite SPA fallback
 * This serves index.html for non-API routes.
 */
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(frontendDistPath, "index.html"));
});

/**
 * 404 for unknown API routes
 */
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API route not found",
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Serving frontend from: ${frontendDistPath}`);
});
