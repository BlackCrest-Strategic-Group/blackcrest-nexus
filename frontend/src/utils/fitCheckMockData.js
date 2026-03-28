/**
 * Mock data used by the AI Fit Check feature.
 * Replace with real API-sourced data when available.
 */

export const MOCK_COMPANY_PROFILE = {
  naicsCodes: ["541511", "541512", "541519", "541330"],
  setAsideStatus: ["small business"],
  setAside: "small business",
  monthlyCapacityHours: 1000,
  currentUtilization: 60,
  leanSavingsHours: 0
};

export const MOCK_SUPPLIERS = [
  { name: "TechForce Solutions",    naics: ["541511", "541512"], pastPerformanceScore: 88, onTimeDelivery: 92, complianceRisk: "low" },
  { name: "Federal Systems Group",  naics: ["541511", "541330"], pastPerformanceScore: 82, onTimeDelivery: 87, complianceRisk: "low" },
  { name: "GovTech Partners",       naics: ["541519", "541512"], pastPerformanceScore: 75, onTimeDelivery: 80, complianceRisk: "medium" },
  { name: "Apex Contract Services", naics: ["541511"],           pastPerformanceScore: 91, onTimeDelivery: 95, complianceRisk: "low" },
  { name: "BlueRidge IT Solutions", naics: ["541512", "541519"], pastPerformanceScore: 78, onTimeDelivery: 83, complianceRisk: "low" }
];
