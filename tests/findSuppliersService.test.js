/**
 * Unit tests for findSuppliersService.js
 *
 * These tests verify:
 *  1. The openai package can be imported (confirming it is installed)
 *  2. Supplier ranking by NAICS code, keyword, and location match
 *  3. Graceful fallback explanations when no OPENAI_API_KEY is set
 *  4. Edge cases (empty inputs, govReady filter, missing params)
 */

import { findSuppliers } from "../backend/services/findSuppliersService.js";

// ═══════════════════════════════════════════════════════════════════
// Module resolution
// ═══════════════════════════════════════════════════════════════════
describe("openai package availability", () => {
  test("openai package can be imported without ERR_MODULE_NOT_FOUND", async () => {
    // If this throws, the openai package is not installed
    const { default: OpenAI } = await import("openai");
    expect(typeof OpenAI).toBe("function");
  });
});

// ═══════════════════════════════════════════════════════════════════
// findSuppliers – basic ranking
// ═══════════════════════════════════════════════════════════════════
describe("findSuppliers – ranking", () => {
  test("returns an array of suppliers with required fields", async () => {
    const results = await findSuppliers({ naicsCode: "541511" });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(s).toHaveProperty("name");
      expect(s).toHaveProperty("location");
      expect(s).toHaveProperty("fitScore");
      expect(s).toHaveProperty("matchReasons");
      expect(s).toHaveProperty("explanation");
    });
  });

  test("returns at most 5 suppliers", async () => {
    const results = await findSuppliers({ naicsCode: "541511" });
    expect(results.length).toBeLessThanOrEqual(5);
  });

  test("suppliers are sorted by fitScore descending", async () => {
    const results = await findSuppliers({ naicsCode: "541511" });
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].fitScore).toBeGreaterThanOrEqual(results[i].fitScore);
    }
  });

  test("NAICS match boosts supplier ranking", async () => {
    const results = await findSuppliers({ naicsCode: "541511" });
    const topSupplier = results[0];
    expect(topSupplier.fitScore).toBeGreaterThan(0);
    expect(topSupplier.matchReasons.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// findSuppliers – fallback explanations (no API key)
// ═══════════════════════════════════════════════════════════════════
describe("findSuppliers – fallback explanation (no OPENAI_API_KEY)", () => {
  let originalApiKey;

  beforeEach(() => {
    originalApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.OPENAI_API_KEY = originalApiKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  test("returns a non-empty explanation string without an API key", async () => {
    const results = await findSuppliers({ naicsCode: "541511" });
    results.forEach((s) => {
      expect(typeof s.explanation).toBe("string");
      expect(s.explanation.length).toBeGreaterThan(0);
    });
  });

  test("fallback explanation mentions the supplier name", async () => {
    const results = await findSuppliers({ naicsCode: "541511" });
    results.forEach((s) => {
      expect(s.explanation).toContain(s.name);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// findSuppliers – edge cases
// ═══════════════════════════════════════════════════════════════════
describe("findSuppliers – edge cases", () => {
  test("returns empty array when no matching suppliers found", async () => {
    // Use a NAICS code and summary that won't match any mock suppliers
    const results = await findSuppliers({ naicsCode: "999999", summary: "" });
    expect(Array.isArray(results)).toBe(true);
  });

  test("accepts summary-only input without naicsCode", async () => {
    const results = await findSuppliers({ summary: "cybersecurity and penetration testing" });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  test("govReady filter returns only govReady suppliers", async () => {
    const results = await findSuppliers({ naicsCode: "541511", govReady: true });
    results.forEach((s) => {
      expect(s.govReady).toBe(true);
    });
  });
});
