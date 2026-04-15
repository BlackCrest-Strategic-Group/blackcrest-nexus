export const ANALYSIS_MODES = {
  FEDERAL: "federal",
  COMMERCIAL: "commercial",
  HYBRID: "hybrid"
};

const FEDERAL_CLAUSE_RULES = [
  { name: "FAR 52.212-1", terms: ["52.212-1", "instructions to offerors—commercial products and services"] },
  { name: "FAR 52.212-2", terms: ["52.212-2", "evaluation criteria—commercial products and services"] },
  { name: "FAR 52.219-6", terms: ["52.219-6", "small business set-aside"] },
  { name: "FAR 52.233-1", terms: ["52.233-1", "disputes"] },
  { name: "DFARS 252.204-7012", terms: ["252.204-7012", "covered defense information"] },
  { name: "DFARS 252.204-7020", terms: ["252.204-7020", "nist sp 800-171 dod assessment"] },
  { name: "DFARS 252.215-7008", terms: ["252.215-7008"] }
];

const COMMERCIAL_CLAUSE_RULES = [
  { name: "Limitation of Liability", terms: ["limitation of liability", "liability cap", "indirect damages"] },
  { name: "Auto-Renewal", terms: ["auto-renew", "automatic renewal", "renewal term"] },
  { name: "Net Terms", terms: ["net 30", "net 45", "net 60", "payment terms"] },
  { name: "Data Processing Addendum", terms: ["data processing addendum", "dpa", "data protection addendum"] }
];

export const POSITIVE_RULES = [
  {
    label: "Set-aside language detected",
    points: 15,
    tests: ["small business", "sdvosb", "hubzone", "wosb", "8(a)", "set-aside"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Incumbent or past performance language detected",
    points: 10,
    tests: ["past performance", "relevant experience", "cpars", "incumbent"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Pricing structure identified",
    points: 10,
    tests: ["firm-fixed-price", "ffp", "time-and-materials", "t&m", "cost-plus", "msa", "sow"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Statement of work / scope language found",
    points: 10,
    tests: ["statement of work", "performance work statement", "pws", "scope of work", "scope"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Evaluation criteria found",
    points: 15,
    tests: ["evaluation criteria", "best value", "tradeoff", "technically acceptable", "lpta", "selection criteria"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Submission instructions found",
    points: 10,
    tests: ["instructions to offerors", "submission", "proposal due", "closing date", "submission deadline"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  }
];

export const NEGATIVE_RULES = [
  {
    label: "Security / clearance requirement detected",
    points: 20,
    tests: ["secret clearance", "top secret", "classified", "sci", "facility clearance"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Complex compliance burden detected",
    points: 10,
    tests: ["cmmc", "nist 800-171", "dcma", "dibr", "cybersecurity maturity", "sox", "hipaa", "pci"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Heavy staffing requirement detected",
    points: 10,
    tests: ["key personnel", "minimum staffing", "resume requirements", "staffing plan"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Aggressive turnaround detected",
    points: 15,
    tests: ["within 24 hours", "within 48 hours", "urgent", "expedited", "immediate response", "asap"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Bonding / insurance burden detected",
    points: 10,
    tests: ["bonding", "performance bond", "liability insurance", "certificate of insurance"],
    modes: [ANALYSIS_MODES.FEDERAL, ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  },
  {
    label: "Commercial indemnification burden detected",
    points: 12,
    tests: ["indemnify", "hold harmless", "unlimited liability"],
    modes: [ANALYSIS_MODES.COMMERCIAL, ANALYSIS_MODES.HYBRID]
  }
];

export function getClauseRules(mode) {
  if (mode === ANALYSIS_MODES.COMMERCIAL) return COMMERCIAL_CLAUSE_RULES;
  if (mode === ANALYSIS_MODES.HYBRID) return [...FEDERAL_CLAUSE_RULES, ...COMMERCIAL_CLAUSE_RULES];
  return FEDERAL_CLAUSE_RULES;
}
