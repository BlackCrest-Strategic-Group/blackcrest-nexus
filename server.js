import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./backend/config/db.js";
import { startOpportunityIngestionCron } from "./backend/services/opportunityIngestionService.js";
import { requestLogger, responseLogger } from "./backend/middleware/logger.js";
import { errorHandler, notFoundHandler } from "./backend/middleware/errorHandler.js";

dotenv.config();

const app = express();

if (process.env.MONGODB_URI) {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
  }
} else {
  console.warn("MONGODB_URI is not set. Persistent features are disabled.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, "frontend", "dist");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(requestLogger);
app.use(responseLogger);
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy", environment: NODE_ENV, timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API is healthy", environment: NODE_ENV, timestamp: new Date().toISOString() });
});

app.get("/api/version", (_req, res) => {
  res.status(200).json({
    product: "BlackCrest Procurement Intelligence Operating System",
    version: "4.0",
  });
});

async function mountRoute(routePath, candidates) {
  for (const modulePath of candidates) {
    try {
      const routeModule = await import(modulePath);
      app.use(routePath, routeModule.default);
      console.log(`Loaded ${routePath} from ${modulePath}`);
      return;
    } catch (error) {
      console.warn(`Could not load ${modulePath} for ${routePath}: ${error.message}`);
    }
  }
}

await mountRoute("/api", ["./backend/routes/procurement.js"]);
await mountRoute("/api/suppliers", ["./backend/routes/suppliers.js"]);
await mountRoute("/api/opportunities", ["./backend/routes/opportunities.js"]);
await mountRoute("/api/truth-serum", ["./backend/routes/truthSerum.js"]);
await mountRoute("/api/funding", ["./backend/routes/funding.js"]);
await mountRoute("/api/auth", ["./backend/routes/auth.js", "./routes/auth.js"]);
await mountRoute("/api/mfa", ["./backend/routes/mfa.js"]);
await mountRoute("/api/email", ["./backend/routes/email.js"]);
await mountRoute("/api/dashboard", ["./backend/routes/dashboard.js"]);
await mountRoute("/api/intelligence", ["./backend/routes/intelligence.js"]);
await mountRoute("/api/docs", ["./backend/routes/docs.js"]);
await mountRoute("/api/analyze-rfp", ["./server/routes/analyzeRfpRoutes.js"]);

app.use(express.static(frontendDistPath));

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  return res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

startOpportunityIngestionCron();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Serving frontend from: ${frontendDistPath}`);
});
