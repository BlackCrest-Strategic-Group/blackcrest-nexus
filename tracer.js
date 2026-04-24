/**
 * Datadog APM tracer initialization.
 *
 * This file MUST be the very first import in server.js so that dd-trace
 * can instrument all subsequently loaded modules (Express, http, fetch, etc.).
 *
 * Configuration is driven entirely by environment variables so no secrets
 * are ever committed to source control.  See .env.example for the full list.
 */

import tracer from "dd-trace";
import { loadEnv } from "./backend/utils/loadEnv.js";

// Load .env before reading any DD_* variables so local development works
// without having to export vars in the shell. loadEnv() is idempotent and
// never overwrites already-set environment variables.
loadEnv();

const isEnabled =
  process.env.DD_ENABLED === "true";

if (isEnabled) {
  tracer.init({
    // ----------------------------------------------------------------
    // Core identity – shown in every trace, log, and metric in Datadog
    // ----------------------------------------------------------------
    service: process.env.DD_SERVICE || "blackcrest-opportunityos",
    env: process.env.DD_ENV || process.env.NODE_ENV || "development",
    version: process.env.DD_VERSION || "1.0.0",

    // ----------------------------------------------------------------
    // Datadog site – use datadoghq.com (US1) unless your account is on
    // a different region (e.g. datadoghq.eu, us3.datadoghq.com, etc.)
    // ----------------------------------------------------------------
    site: process.env.DD_SITE || "datadoghq.com",

    // ----------------------------------------------------------------
    // Automatically correlate APM traces with Datadog Logs
    // ----------------------------------------------------------------
    logInjection: true,

    // ----------------------------------------------------------------
    // Runtime Metrics (CPU, memory, event-loop lag, GC) sent to
    // DogStatsD on the local Datadog Agent (port 8125 by default)
    // ----------------------------------------------------------------
    runtimeMetrics: true,

    // ----------------------------------------------------------------
    // Profiling – continuous profiling of CPU / heap (optional, adds
    // slight overhead; enable in production when you need deep analysis)
    // ----------------------------------------------------------------
    profiling: process.env.DD_PROFILING_ENABLED === "true",
  });

  console.log(
    `[Datadog] APM enabled — service="${process.env.DD_SERVICE || "blackcrest-opportunityos"}" env="${process.env.DD_ENV || process.env.NODE_ENV || "development"}"`
  );
} else {
  console.log(
    "[Datadog] APM disabled. Set DD_ENABLED=true to activate."
  );
}

export { tracer };
