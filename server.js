import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./backend/config/db.js";

dotenv.config();

const app = express();

if (process.env.MONGODB_URI) {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
  }
} else {
  console.warn("MONGODB_URI is not set. Persistent features (auth, profiles, workflows) are disabled.");
}

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

app.get("/api/version", (req, res) => {
  res.status(200).json({
    product: "BlackCrest Opportunity & Funding Intelligence Engine",
    version: "3.0",
  });
});

/**
 * API routes
 */
async function mountRoute(path, candidates) {
  for (const modulePath of candidates) {
    try {
      const routeModule = await import(modulePath);
      app.use(path, routeModule.default);
      console.log(`Loaded ${path} from ${modulePath}`);
      return;
    } catch (error) {
      console.warn(`Could not load ${modulePath} for ${path}: ${error.message}`);
    }
  }
}

await mountRoute("/api/opportunities", ["./backend/routes/opportunities.js"]);
await mountRoute("/api/funding", ["./backend/routes/funding.js"]);
await mountRoute("/api/auth", ["./backend/routes/auth.js", "./routes/auth.js"]);
await mountRoute("/api/mfa", ["./backend/routes/mfa.js"]);
await mountRoute("/api/email", ["./backend/routes/email.js"]);
await mountRoute("/api/dashboard", ["./backend/routes/dashboard.js"]);
await mountRoute("/api/docs", ["./backend/routes/docs.js"]);
await mountRoute("/api-docs", ["./routes/docs.js"]);

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
