/**
 * Mock Company Profile — BlackCrest Sourcing Group (demo data)
 *
 * Used as a default / fallback profile when the caller does not supply one.
 * Real profiles should be loaded from the CompanyProfile MongoDB collection.
 */

export const mockCompanyProfile = {
  companyName: "BlackCrest Sourcing Group",

  // NAICS codes the company is qualified and experienced in
  naicsCodes: [
    "541512", // Computer Systems Design Services
    "541511", // Custom Computer Programming Services
    "541519", // Other Computer Related Services
    "541611", // Management Consulting Services
    "561110", // Office Administrative Services
    "541330", // Engineering Services
  ],

  // Small business set-aside designations held
  setAsideStatus: ["SDVOSB", "Small Business", "SB"],

  // Core capability keywords used for description matching
  capabilities: [
    "software development",
    "it consulting",
    "systems integration",
    "cybersecurity",
    "program management",
    "data analytics",
    "cloud migration",
    "help desk",
    "training",
    "logistics support",
  ],

  // Certifications and compliance frameworks the company holds
  certifications: [
    "iso 9001",
    "cmmc level 1",
    "soc 2",
  ],

  // Preferred/known agencies — used to boost agency relevance score
  preferredAgencies: [
    "Department of Veterans Affairs",
    "VA",
    "GSA",
    "General Services Administration",
    "Department of Labor",
    "HHS",
    "Department of Health",
    "Small Business Administration",
    "SBA",
  ],

  // Contract dollar range the company typically pursues
  minContractValue: 100_000,   // $100K
  maxContractValue: 10_000_000, // $10M

  // States the company is operationally capable of supporting
  statesServed: [
    "dc",
    "va",
    "md",
    "tx",
    "fl",
    "remote",
    "nationwide",
  ],

  // Capacity data (used by separate capacity assessment service)
  monthlyCapacityHours: 2000,
  currentUtilization: 65,
  leanSavingsHours: 100,
  riskTolerance: "medium",
};
