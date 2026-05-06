export class FundingProviderAdapter {
  constructor(config) {
    this.config = config;
  }

  getMetadata() {
    return this.config;
  }

  async submitFundingRequest(_requestPayload) {
    throw new Error('submitFundingRequest is not implemented for this adapter yet.');
  }
}

export function createProviderRegistry(providerConfigs = []) {
  return providerConfigs.map((config) => new FundingProviderAdapter(config));
}

export const demoFundingProviders = createProviderRegistry([
  {
    id: 'summit-capital',
    providerName: 'Summit Capital Partners',
    fundingTypes: ['Invoice Financing', 'Purchase Order Financing'],
    approvalSpeed: '24-48 hours',
    regionsSupported: ['North America', 'United Kingdom'],
    industriesServed: ['Manufacturing', 'Government Contracting', 'Logistics']
  },
  {
    id: 'atlas-credit',
    providerName: 'Atlas Credit Network',
    fundingTypes: ['Supply Chain Funding', 'Working Capital Requests'],
    approvalSpeed: '3-5 business days',
    regionsSupported: ['North America', 'EU'],
    industriesServed: ['Defense', 'Aerospace', 'Industrial Services']
  }
]);
