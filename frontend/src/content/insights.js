export const insightsArticles = [
  {
    slug: 'what-is-procurement-intelligence',
    title: 'What Is Procurement Intelligence? | BlackCrest OS Insights',
    metaDescription: 'Learn what procurement intelligence is, why it matters, and how AI helps teams make faster, better sourcing decisions.',
    heading: 'What Is Procurement Intelligence?',
    excerpt: 'Procurement intelligence turns fragmented supplier, market, and opportunity data into decision-ready insights for sourcing and procurement teams.',
    publishedAt: '2026-04-22',
    updatedAt: '2026-04-22',
    readTime: '8 min read',
    body: [
      'Procurement intelligence is the practice of collecting, structuring, and analyzing procurement data so teams can make better purchasing and sourcing decisions. It combines internal information such as supplier performance, contracts, and bid history with external signals such as market conditions, supplier events, and public opportunities.',
      'For procurement teams, intelligence matters because speed and confidence both affect outcomes. When decisions rely on disconnected spreadsheets and inboxes, qualification cycles slow down. A procurement intelligence platform centralizes these workflows so teams can compare opportunities, evaluate suppliers, and prioritize actions in one system.',
      'At BlackCrest OS, procurement intelligence is organized across Opportunity Intelligence, Supplier Intelligence, Sourcing Intelligence, Proposal Intelligence, and Category Intelligence. This helps teams move from raw data to decision-ready recommendations that are explainable and auditable.'
    ]
  },
  {
    slug: 'procurement-intelligence-vs-spend-analytics',
    title: 'Procurement Intelligence vs Spend Analytics | BlackCrest OS Insights',
    metaDescription: 'Compare procurement intelligence and spend analytics to understand when each approach supports sourcing and supplier decisions.',
    heading: 'Procurement Intelligence vs Spend Analytics',
    excerpt: 'Spend analytics explains where money went. Procurement intelligence supports what to do next.',
    publishedAt: '2026-04-22',
    updatedAt: '2026-04-22',
    readTime: '9 min read',
    body: [
      'Spend analytics is retrospective. It helps teams classify spend, identify trends, and manage category performance over time. That is essential, but it does not always provide forward-looking guidance for opportunity qualification or supplier risk decisions.',
      'Procurement intelligence combines spend patterns with operational signals and opportunity context. It helps buyers evaluate supplier readiness, sourcing paths, and procurement risk before commitments are made.',
      'In practice, organizations need both. Spend analytics provides baseline visibility, while procurement intelligence improves tactical and strategic decision quality in active workflows.'
    ]
  },
  {
    slug: 'how-ai-improves-supplier-intelligence',
    title: 'How AI Improves Supplier Intelligence | BlackCrest OS Insights',
    metaDescription: 'See how AI improves supplier intelligence with faster profile analysis, risk monitoring, and sourcing decision support.',
    heading: 'How AI Improves Supplier Intelligence',
    excerpt: 'AI helps procurement teams process more supplier signals quickly while preserving human oversight and governance.',
    publishedAt: '2026-04-22',
    updatedAt: '2026-04-22',
    readTime: '7 min read',
    body: [
      'Supplier intelligence requires evaluating capability, reliability, compliance posture, and fit for specific procurement needs. AI helps accelerate this by summarizing supplier data, flagging potential issues, and surfacing comparable alternatives.',
      'The key is controlled automation. High-trust organizations use AI to reduce manual triage work, then keep humans in the loop for final decisions. This pattern improves throughput without sacrificing accountability.',
      'BlackCrest OS uses AI to support supplier evaluations, detect procurement signals, and highlight risk-relevant data so sourcing managers can act faster with clearer context.'
    ]
  },
  {
    slug: 'how-to-evaluate-procurement-opportunities-faster',
    title: 'How to Evaluate Procurement Opportunities Faster | BlackCrest OS Insights',
    metaDescription: 'A practical framework for evaluating procurement opportunities faster with stronger bid/no-bid discipline.',
    heading: 'How to Evaluate Procurement Opportunities Faster',
    excerpt: 'Faster opportunity evaluation starts with clear criteria, structured workflows, and reusable procurement intelligence.',
    publishedAt: '2026-04-22',
    updatedAt: '2026-04-22',
    readTime: '8 min read',
    body: [
      'Procurement and GovCon teams often struggle with opportunity overload. Valuable opportunities can be missed when reviews are inconsistent or delayed.',
      'A practical approach is to standardize qualification inputs: strategic fit, capability match, supplier coverage, timing feasibility, and procurement risk. Teams can then score opportunities consistently and prioritize the highest-value work first.',
      'BlackCrest OS helps teams run this process with Opportunity Intelligence and Proposal Intelligence workflows that surface fit, risks, and readiness signals early in the cycle.'
    ]
  }
];

export function getInsightBySlug(slug) {
  return insightsArticles.find((article) => article.slug === slug);
}
