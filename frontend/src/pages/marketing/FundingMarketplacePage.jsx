import React, { useMemo, useState } from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';

const initialProfile = {
  businessName: '',
  industry: '',
  location: '',
  yearsInBusiness: '',
  annualRevenue: '',
  certifications: '',
  opportunityName: '',
  opportunityValue: '',
  requestedAmount: '',
  fundingNeedType: 'Working capital',
  timeline: '',
  useOfFunds: '',
  pastPerformance: '',
  documents: []
};

const documentOptions = [
  'Business overview',
  'Opportunity or contract summary',
  'Use-of-funds statement',
  'Recent bank statements',
  'Financial statements or tax returns',
  'Customer purchase order or award notice',
  'Past performance or customer references'
];

const partnerTypes = [
  'CDFI / community capital',
  'SBA and bank lending',
  'Purchase order financing',
  'Invoice factoring',
  'Equipment finance',
  'Grant and economic development support'
];

function calculateReadiness(profile) {
  let score = 0;
  const years = Number(profile.yearsInBusiness) || 0;
  const revenue = Number(profile.annualRevenue) || 0;
  const opportunityValue = Number(profile.opportunityValue) || 0;
  const requestedAmount = Number(profile.requestedAmount) || 0;

  if (years >= 2) score += 15;
  else if (years >= 1) score += 8;

  if (revenue >= 1000000) score += 20;
  else if (revenue >= 250000) score += 14;
  else if (revenue >= 50000) score += 8;

  if (opportunityValue > 0) score += 15;
  if (requestedAmount > 0 && opportunityValue > 0 && requestedAmount <= opportunityValue * 0.5) score += 12;
  else if (requestedAmount > 0) score += 6;

  if (profile.useOfFunds.trim().length > 20) score += 12;
  if (profile.timeline) score += 8;
  if (profile.certifications) score += 5;
  if (profile.pastPerformance) score += 8;
  score += Math.min(20, profile.documents.length * 4);

  const normalized = Math.min(100, score);
  const band = normalized >= 75 ? 'Strong' : normalized >= 45 ? 'Moderate' : 'Needs Work';
  return { score: normalized, band };
}

function recommendCategories(profile) {
  const text = `${profile.fundingNeedType} ${profile.useOfFunds}`.toLowerCase();
  const categories = [];

  if (text.includes('inventory') || text.includes('material') || text.includes('purchase order') || text.includes('po')) categories.push('Purchase order financing');
  if (text.includes('invoice') || text.includes('receivable') || text.includes('cashflow') || text.includes('payroll')) categories.push('Invoice factoring / receivables financing');
  if (text.includes('equipment') || text.includes('machine') || text.includes('vehicle') || text.includes('tool')) categories.push('Equipment financing');
  if (text.includes('grant') || text.includes('training') || text.includes('workforce') || text.includes('innovation')) categories.push('Grant and economic development support');
  if (!categories.length) categories.push('Working capital', 'SBA / bank lending', 'CDFI / community capital');

  return [...new Set(categories)];
}

function currency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function FundingMarketplacePage() {
  const [profile, setProfile] = useState(initialProfile);
  const readiness = useMemo(() => calculateReadiness(profile), [profile]);
  const recommendations = useMemo(() => recommendCategories(profile), [profile]);
  const fundingGap = Math.max(0, (Number(profile.requestedAmount) || 0));

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function toggleDocument(documentName) {
    setProfile((current) => {
      const exists = current.documents.includes(documentName);
      return {
        ...current,
        documents: exists
          ? current.documents.filter((item) => item !== documentName)
          : [...current.documents, documentName]
      };
    });
  }

  function submitIntroduction(event) {
    event.preventDefault();
    fetch('/api/funding-marketplace/introduction-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    }).catch(() => undefined);
    window.location.href = `mailto:funding@blackcrestai.com?subject=Funding%20Marketplace%20Introduction%20Request&body=${encodeURIComponent(`Business: ${profile.businessName}\nIndustry: ${profile.industry}\nLocation: ${profile.location}\nRequested amount: ${currency(profile.requestedAmount)}\nUse of funds: ${profile.useOfFunds}\nReadiness: ${readiness.band} (${readiness.score}/100)\nRecommended categories: ${recommendations.join(', ')}`)}`;
  }

  return (
    <MarketingLayout>
      <SeoHead
        title="Small Business Funding Marketplace | BlackCrest"
        description="BlackCrest Funding Marketplace helps small businesses build capital-ready funding packages and connect with lenders, funding partners, grant resources, and contract-financing specialists."
        canonicalPath="/funding-marketplace"
      />
      <main>
        <section className="hero-section container enterprise-hero">
          <p className="eyebrow">BLACKCREST FUNDING MARKETPLACE</p>
          <h1>Capital access for the companies that actually build things.</h1>
          <p>
            Small companies should not lose bigger opportunities just because the money side is broken. BlackCrest helps operators turn real opportunities into funding-ready packages and connect with the right capital pathways.
          </p>
          <p>
            This is the Redneck Robin Hood lane: take the tools usually reserved for polished boardroom giants and put them in the hands of the small business owners doing the actual work.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <a className="btn" href="#funding-profile">Build My Funding Profile</a>
            <a className="btn ghost" href="#partners">Explore Partner Types</a>
          </div>
        </section>

        <section className="container section-grid capability-grid">
          <article className="marketing-card">
            <h2>Find the opportunity</h2>
            <p>Connect procurement, sourcing, GovCon, and commercial opportunities to a real execution plan.</p>
          </article>
          <article className="marketing-card">
            <h2>Package the funding need</h2>
            <p>Turn contract value, use of funds, documentation, and timeline into a capital-readiness profile.</p>
          </article>
          <article className="marketing-card">
            <h2>Connect with capital</h2>
            <p>Match the business to funding categories and partner types without pretending BlackCrest is the lender.</p>
          </article>
        </section>

        <section id="funding-profile" className="container marketing-card">
          <p className="eyebrow">FUNDING READINESS BUILDER</p>
          <h2>Build a small business funding profile</h2>
          <p>
            Fill this out like the first draft of a funding package. The score is not a loan approval. It is a readiness signal, because apparently truth still needs a disclaimer.
          </p>

          <form onSubmit={submitIntroduction} className="section-grid" style={{ marginTop: 16 }}>
            <label>
              Business name
              <input className="input" value={profile.businessName} onChange={(event) => updateField('businessName', event.target.value)} placeholder="ABC Industrial Supply" />
            </label>
            <label>
              Industry
              <input className="input" value={profile.industry} onChange={(event) => updateField('industry', event.target.value)} placeholder="Manufacturing, construction, defense, services..." />
            </label>
            <label>
              Location
              <input className="input" value={profile.location} onChange={(event) => updateField('location', event.target.value)} placeholder="City, State" />
            </label>
            <label>
              Years in business
              <input className="input" type="number" min="0" value={profile.yearsInBusiness} onChange={(event) => updateField('yearsInBusiness', event.target.value)} />
            </label>
            <label>
              Annual revenue
              <input className="input" type="number" min="0" value={profile.annualRevenue} onChange={(event) => updateField('annualRevenue', event.target.value)} placeholder="250000" />
            </label>
            <label>
              Certifications / set-asides
              <input className="input" value={profile.certifications} onChange={(event) => updateField('certifications', event.target.value)} placeholder="Veteran-owned, WOSB, HUBZone, 8(a)..." />
            </label>
            <label>
              Opportunity name
              <input className="input" value={profile.opportunityName} onChange={(event) => updateField('opportunityName', event.target.value)} placeholder="Contract, PO, RFQ, expansion project..." />
            </label>
            <label>
              Opportunity value
              <input className="input" type="number" min="0" value={profile.opportunityValue} onChange={(event) => updateField('opportunityValue', event.target.value)} placeholder="500000" />
            </label>
            <label>
              Funding amount needed
              <input className="input" type="number" min="0" value={profile.requestedAmount} onChange={(event) => updateField('requestedAmount', event.target.value)} placeholder="125000" />
            </label>
            <label>
              Funding need type
              <select className="input" value={profile.fundingNeedType} onChange={(event) => updateField('fundingNeedType', event.target.value)}>
                <option>Working capital</option>
                <option>Purchase order financing</option>
                <option>Invoice factoring</option>
                <option>Equipment financing</option>
                <option>SBA / bank lending</option>
                <option>Grant support</option>
                <option>Bonding support</option>
              </select>
            </label>
            <label>
              Timeline
              <input className="input" value={profile.timeline} onChange={(event) => updateField('timeline', event.target.value)} placeholder="Need funding in 30-60 days" />
            </label>
            <label>
              Past performance
              <input className="input" value={profile.pastPerformance} onChange={(event) => updateField('pastPerformance', event.target.value)} placeholder="Similar contracts, customers, work history..." />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Use of funds
              <textarea className="input" rows="4" value={profile.useOfFunds} onChange={(event) => updateField('useOfFunds', event.target.value)} placeholder="Explain what the capital will be used for: payroll, inventory, equipment, materials, supplier deposits, mobilization..." />
            </label>

            <div style={{ gridColumn: '1 / -1' }}>
              <h3>Documents ready</h3>
              <div className="section-grid">
                {documentOptions.map((documentName) => (
                  <label key={documentName} className="marketing-card" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={profile.documents.includes(documentName)} onChange={() => toggleDocument(documentName)} />
                    {documentName}
                  </label>
                ))}
              </div>
            </div>

            <div className="marketing-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Funding readiness: {readiness.band}</h3>
              <p><strong>{readiness.score}/100</strong> readiness score</p>
              <p>Funding amount requested: <strong>{currency(fundingGap)}</strong></p>
              <p>Recommended capital paths: <strong>{recommendations.join(', ')}</strong></p>
              <button className="btn" type="submit">Request Funding Introduction</button>
            </div>
          </form>
        </section>

        <section id="partners" className="container marketing-card">
          <p className="eyebrow">MARKETPLACE PARTNER TYPES</p>
          <h2>Funding paths this marketplace can support</h2>
          <div className="section-grid">
            {partnerTypes.map((type) => (
              <article key={type} className="marketing-card">
                <h3>{type}</h3>
                <p>Used when the business has a real opportunity and needs a cleaner path to capital conversations.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container marketing-card">
          <h2>Compliance boundary</h2>
          <p>
            BlackCrest Funding Marketplace provides business intelligence, funding-readiness workflows, and marketplace introduction support. BlackCrest is not a lender, financial advisor, securities advisor, tax advisor, legal advisor, or guaranteed funding source. Funding decisions, rates, terms, fees, and approvals are determined by independent funding partners.
          </p>
        </section>
      </main>
    </MarketingLayout>
  );
}
