import pdfParse from "pdf-parse/lib/pdf-parse.js";

const MAX_CONTENT_LENGTH = 60000;

export async function parsePdfBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("A valid PDF buffer is required.");
  }

  const parsed = await pdfParse(buffer);
  const text = (parsed?.text || "").replace(/\s+/g, " ").trim();

  if (!text) {
    throw new Error("No readable text was extracted from the PDF.");
  }

  return text.slice(0, MAX_CONTENT_LENGTH);
}

export function normalizeInputText(input = "") {
  const text = String(input).replace(/\s+/g, " ").trim();
  return text.slice(0, MAX_CONTENT_LENGTH);
}
