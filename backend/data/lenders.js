export const lenders = [
  {
    name: "NorthBridge Capital Partners",
    fundingTypes: ["Asset-Based Lending", "Working Capital Line"],
    minAmount: 250000,
    maxAmount: 5000000,
    industries: ["technology", "manufacturing", "logistics", "general"],
    preferredUseCases: ["inventory", "bridge payroll", "project mobilization"],
    notes: "Strong fit for companies with receivables and repeat contract wins."
  },
  {
    name: "Summit Invoice Finance",
    fundingTypes: ["Invoice Factoring", "Receivables Purchase"],
    minAmount: 100000,
    maxAmount: 3000000,
    industries: ["staffing", "healthcare", "logistics", "general"],
    preferredUseCases: ["cash flow smoothing", "fast growth", "short timeline opportunities"],
    notes: "Fast decision cycle for near-term execution windows."
  },
  {
    name: "IronGate Equipment Finance",
    fundingTypes: ["Equipment Financing", "Lease Facility"],
    minAmount: 50000,
    maxAmount: 10000000,
    industries: ["construction", "energy", "manufacturing", "general"],
    preferredUseCases: ["equipment purchase", "fleet expansion", "capex-heavy delivery"],
    notes: "Best for hard-asset backed opportunities."
  },
  {
    name: "Apex Growth Credit",
    fundingTypes: ["Term Loan", "Revenue-Based Financing"],
    minAmount: 500000,
    maxAmount: 15000000,
    industries: ["technology", "healthcare", "professional-services", "general"],
    preferredUseCases: ["scale delivery team", "software implementation", "multi-phase projects"],
    notes: "Prefers clear execution plans and recurring revenue."
  },
  {
    name: "Harborline SBA Network",
    fundingTypes: ["SBA 7(a)", "SBA Express"],
    minAmount: 150000,
    maxAmount: 5000000,
    industries: ["general"],
    preferredUseCases: ["owner-operator growth", "expansion capital", "working capital"],
    notes: "Conservative underwriting but broad sector eligibility."
  }
];

export default lenders;
