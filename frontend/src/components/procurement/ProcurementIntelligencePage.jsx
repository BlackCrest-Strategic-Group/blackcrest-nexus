import React from "react";
import "./procurement.css";

const kpiData = [
  { id: "spend", label: "Total Spend", value: "$284.6M", delta: "+6.4% vs Q1", tone: "gold" },
  { id: "suppliers", label: "Active Suppliers", value: "326", delta: "41 strategic", tone: "neutral" },
  { id: "savings", label: "Sourcing Savings Identified", value: "$18.2M", delta: "74% capture forecast", tone: "positive" },
  { id: "actions", label: "Open Procurement Actions", value: "58", delta: "17 due this week", tone: "warning" },
  { id: "lead", label: "Average Lead Time", value: "42 days", delta: "-4 days vs baseline", tone: "positive" },
  { id: "risk", label: "Supplier Risk Score", value: "63 / 100", delta: "8 suppliers above 80", tone: "warning" },
];

const spendByCategory = [
  { category: "Direct Materials", spend: 94.5 },
  { category: "Electronics", spend: 61.3 },
  { category: "Logistics", spend: 47.2 },
  { category: "MRO", spend: 32.8 },
  { category: "IT Services", spend: 28.4 },
  { category: "Professional Services", spend: 20.4 },
];

const monthlyTrends = [
  { month: "Jan", spend: 21, savings: 1.1 },
  { month: "Feb", spend: 22, savings: 1.3 },
  { month: "Mar", spend: 24, savings: 1.6 },
  { month: "Apr", spend: 23, savings: 1.2 },
  { month: "May", spend: 26, savings: 1.7 },
  { month: "Jun", spend: 27, savings: 1.9 },
  { month: "Jul", spend: 25, savings: 1.8 },
  { month: "Aug", spend: 24, savings: 1.5 },
  { month: "Sep", spend: 23, savings: 1.4 },
  { month: "Oct", spend: 25, savings: 1.9 },
  { month: "Nov", spend: 22, savings: 1.4 },
  { month: "Dec", spend: 22.6, savings: 1.4 },
];

const sourcingPipeline = [
  { stage: "Scoping", value: 11.2 },
  { stage: "RFQ Live", value: 17.8 },
  { stage: "Negotiation", value: 23.1 },
  { stage: "Award Pending", value: 14.6 },
  { stage: "Contracting", value: 8.7 },
];

const riskHeatmap = [
  { supplier: "Northline Metals", quality: 2, delivery: 4, financial: 3 },
  { supplier: "Helios Circuits", quality: 4, delivery: 4, financial: 5 },
  { supplier: "Ridgeway Polymers", quality: 3, delivery: 2, financial: 2 },
  { supplier: "Atlas Freight", quality: 2, delivery: 5, financial: 4 },
  { supplier: "Sierra Components", quality: 5, delivery: 3, financial: 3 },
];

const activityRows = [
  {
    event: "Supplier updates",
    detail: "Helios Circuits submitted updated PPAP and capacity plan for Q3 controller boards.",
    owner: "Supplier Quality",
    when: "08:42",
    status: "Reviewed",
  },
  {
    event: "RFQ actions",
    detail: "RFQ-2421 for precision castings moved to best-and-final with 3 shortlisted bidders.",
    owner: "Strategic Sourcing",
    when: "09:15",
    status: "In Progress",
  },
  {
    event: "Approvals",
    detail: "Executive approval issued for multi-year logistics framework with Atlas Freight.",
    owner: "CPO Office",
    when: "11:03",
    status: "Approved",
  },
  {
    event: "Delayed deliveries",
    detail: "PO-88317 delayed by 5 days due to port congestion at Long Beach terminal.",
    owner: "Operations",
    when: "12:27",
    status: "Mitigation Active",
  },
];

const dashboardSections = [
  "Spend Overview",
  "Supplier Risk",
  "Margin Leakage",
  "Open RFQs",
  "Procurement Alerts",
  "Contract Exposure",
  "Delivery Risks",
  "Savings Opportunities",
];

function KpiCard({ label, value, delta, tone }) {
  return (
    <article className={`hub-kpi ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{delta}</span>
    </article>
  );
}

function SectionChips() {
  return (
    <div className="hub-section-chips">
      {dashboardSections.map((section) => (
        <span key={section}>{section}</span>
      ))}
    </div>
  );
}

export default function ProcurementIntelligencePage() {
  const maxCategorySpend = Math.max(...spendByCategory.map((item) => item.spend));
  const maxPipelineValue = Math.max(...sourcingPipeline.map((item) => item.value));

  return (
    <main className="hub-page">
      <header className="hub-header">
        <h1>Procurement Intelligence Hub</h1>
        <p>Enterprise command center for spend control, sourcing velocity, supplier resilience, and margin protection.</p>
      </header>

      <SectionChips />

      <section className="hub-kpi-grid">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} />
        ))}
      </section>

      <section className="hub-widget-grid">
        <article className="hub-card">
          <h2>Spend by Category</h2>
          <div className="bar-list">
            {spendByCategory.map((item) => (
              <div key={item.category} className="bar-item">
                <span>{item.category}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(item.spend / maxCategorySpend) * 100}%` }} />
                </div>
                <strong>${item.spend}M</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="hub-card">
          <h2>Supplier Risk Heatmap</h2>
          <div className="heatmap-grid">
            <div className="heatmap-head" />
            <div className="heatmap-head">Quality</div>
            <div className="heatmap-head">Delivery</div>
            <div className="heatmap-head">Financial</div>
            {riskHeatmap.map((row) => (
              <React.Fragment key={row.supplier}>
                <div className="heatmap-supplier">{row.supplier}</div>
                {[row.quality, row.delivery, row.financial].map((score, index) => (
                  <div key={`${row.supplier}-${index}`} className={`heatmap-cell risk-${score}`}>{score}</div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </article>

        <article className="hub-card">
          <h2>Monthly Procurement Trends</h2>
          <div className="trend-line" aria-label="monthly procurement trends chart">
            {monthlyTrends.map((point) => (
              <div key={point.month} className="trend-point" style={{ height: `${point.spend * 2.4}px` }}>
                <span className="trend-label">{point.month}</span>
                <span className="trend-value">${point.spend}M</span>
              </div>
            ))}
          </div>
          <p className="card-footnote">Annualized sourcing savings run-rate: ${monthlyTrends.reduce((acc, item) => acc + item.savings, 0).toFixed(1)}M</p>
        </article>

        <article className="hub-card">
          <h2>Sourcing Pipeline</h2>
          <div className="bar-list">
            {sourcingPipeline.map((stage) => (
              <div key={stage.stage} className="bar-item">
                <span>{stage.stage}</span>
                <div className="bar-track">
                  <div className="bar-fill pipeline" style={{ width: `${(stage.value / maxPipelineValue) * 100}%` }} />
                </div>
                <strong>${stage.value}M</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="hub-card">
        <h2>Recent Procurement Activity</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Activity Type</th>
                <th>Details</th>
                <th>Owner</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row) => (
                <tr key={`${row.event}-${row.when}`}>
                  <td>{row.event}</td>
                  <td>{row.detail}</td>
                  <td>{row.owner}</td>
                  <td>{row.when}</td>
                  <td><span className="status-pill">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
