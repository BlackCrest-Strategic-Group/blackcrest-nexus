/**
 * API Documentation Routes
 *
 * Serves:
 *  - GET /api-docs          → Swagger UI (interactive explorer)
 *  - GET /api-reference     → Redirect to Swagger UI
 *  - GET /api-docs/openapi.json → Raw OpenAPI spec (JSON)
 *  - GET /api-docs/openapi.yaml → Raw OpenAPI spec (YAML)
 */

import express from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import yaml from "js-yaml";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load OpenAPI spec from YAML file
const specPath = join(__dirname, "../../docs/openapi.yaml");
const specYaml = readFileSync(specPath, "utf8");
const swaggerSpec = yaml.load(specYaml);

// Swagger UI options for a polished appearance
const swaggerUiOptions = {
  customSiteTitle: "GovCon AI Scanner — API Docs",
  customCss: `
    .swagger-ui .topbar { background-color: #1e3a5f; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #1e3a5f; font-size: 2rem; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 12px; border-radius: 6px; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #3b82f6; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #10b981; }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #f59e0b; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444; }
  `,
  swaggerOptions: {
    docExpansion: "list",
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true
  }
};

// Serve Swagger UI at /api-docs
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Redirect /api-reference to /api-docs
router.get("/api-reference", (req, res) => {
  res.redirect("/api-docs");
});

// Serve raw spec as JSON (useful for code generators)
router.get("/api-docs/openapi.json", (req, res) => {
  res.json(swaggerSpec);
});

// Serve raw spec as YAML
router.get("/api-docs/openapi.yaml", (req, res) => {
  res.type("text/yaml").send(specYaml);
});

export default router;
