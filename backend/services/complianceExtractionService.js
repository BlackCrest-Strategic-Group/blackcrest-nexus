const FAR_PATTERN = /\b(?:FAR|DFARS)\s*(?:clause\s*)?(\d{2,3}\.\d{3,4}(?:-\d{1,4})?)\b/gi;

const CHECKLIST_LIBRARY = [
  { keyword: "52.204-21", task: "Implement basic safeguarding controls for covered contractor information." },
  { keyword: "252.204-7012", task: "Validate incident reporting and controlled unclassified information handling." },
  { keyword: "52.219-14", task: "Confirm limitation on subcontracting percentages in teaming plan." },
  { keyword: "252.215-7008", task: "Prepare single-offer disclosure narrative and pricing rationale." }
];

export function extractFarDfarsCompliance(text = "") {
  const matches = [...String(text).matchAll(FAR_PATTERN)].map((m) => m[1]);
  const uniqueClauses = [...new Set(matches)];

  const checklist = CHECKLIST_LIBRARY
    .filter((item) => uniqueClauses.includes(item.keyword))
    .map((item) => ({ clause: item.keyword, requirement: item.task, status: "REVIEW" }));

  return { clauses: uniqueClauses, checklist };
}
