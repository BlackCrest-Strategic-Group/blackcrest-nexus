export const COUNTRY_RISK_SCORES = [
  {
    country: 'China',
    geopoliticalRisk: 84,
    tariffRisk: 78,
    logisticsRisk: 61,
    sanctionsExposure: 55,
    weatherExposure: 49,
    executiveSummary: 'Elevated geopolitical and tariff volatility impacting electronics and industrial sourcing.'
  },
  {
    country: 'Taiwan',
    geopoliticalRisk: 91,
    tariffRisk: 52,
    logisticsRisk: 57,
    sanctionsExposure: 38,
    weatherExposure: 44,
    executiveSummary: 'Critical semiconductor concentration and regional instability exposure.'
  },
  {
    country: 'Vietnam',
    geopoliticalRisk: 48,
    tariffRisk: 41,
    logisticsRisk: 52,
    sanctionsExposure: 19,
    weatherExposure: 58,
    executiveSummary: 'Growing manufacturing alternative with moderate logistics and weather exposure.'
  },
  {
    country: 'Mexico',
    geopoliticalRisk: 44,
    tariffRisk: 29,
    logisticsRisk: 39,
    sanctionsExposure: 11,
    weatherExposure: 47,
    executiveSummary: 'Nearshoring growth market with favorable North American trade positioning.'
  }
];

export function getCountryRiskOverview() {
  return COUNTRY_RISK_SCORES.map((country) => ({
    ...country,
    compositeRisk: Math.round((
      country.geopoliticalRisk +
      country.tariffRisk +
      country.logisticsRisk +
      country.sanctionsExposure +
      country.weatherExposure
    ) / 5)
  })).sort((a, b) => b.compositeRisk - a.compositeRisk);
}
