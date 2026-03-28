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
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the OpenAPI spec
const openapiPath = join(__dirname, "../../docs/openapi.yaml");

// Load OpenAPI spec from YAML file if it exists
let specYaml = "";
try {
  specYaml = readFileSync(openapiPath, "utf8");
} catch {
  specYaml = "# OpenAPI spec not found";
}

// Serve Swagger UI at /api-docs
router.get("/api-docs", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GovCon AI Scanner - API Explorer</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .topbar { background: #1e3a5f !important; }
    .swagger-ui .info .title { color: #1e3a5f; }
    .swagger-ui .btn.authorize { background: #1e3a5f; border-color: #1e3a5f; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api-docs/openapi.yaml",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
        deepLinking: true,
        displayRequestDuration: true,
        persistAuthorization: true,
        tryItOutEnabled: true
      });
    };
  </script>
</body>
</html>`);
});

// Serve raw spec as JSON
router.get("/api-docs/openapi.json", (req, res) => {
  if (!fs.existsSync(openapiPath)) {
    return res.status(404).json({ success: false, error: "OpenAPI spec not found." });
  }
  res.json({ message: "OpenAPI spec available at /api-docs/openapi.yaml" });
});

// Serve raw spec as YAML
router.get("/api-docs/openapi.yaml", (req, res) => {
  if (!fs.existsSync(openapiPath)) {
    return res.status(404).send("OpenAPI spec not found.");
  }
  res.type("text/yaml").send(specYaml);
});

// Redirect /api-reference to /api-docs
router.get("/api-reference", (req, res) => {
  res.redirect("/api-docs");
});

export default router;