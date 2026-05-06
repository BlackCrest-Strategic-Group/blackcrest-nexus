export default function ExecutiveBriefing() {
  const briefingItems = [
    {
      title: 'Supply Chain Exposure',
      value: '$4.8M',
      detail: 'Operational spend currently exposed to supplier instability.',
    },
    {
      title: 'Potential Savings',
      value: '$2.1M',
      detail: 'AI-assisted sourcing opportunities identified across active categories.',
    },
    {
      title: 'Critical Supplier Risks',
      value: '17',
      detail: 'Suppliers currently exceeding operational risk thresholds.',
    },
  ];

  return (
    <div className='bg-zinc-900 border border-amber-500/10 rounded-3xl p-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <div className='text-sm uppercase tracking-[0.3em] text-zinc-500'>
            Executive Visibility
          </div>
          <div className='text-4xl font-black text-amber-400 mt-2'>
            Operational Briefing
          </div>
        </div>

        <div className='h-4 w-4 rounded-full bg-red-500 animate-pulse' />
      </div>

      <div className='grid md:grid-cols-3 gap-6'>
        {briefingItems.map((item) => (
          <div
            key={item.title}
            className='bg-black/40 border border-zinc-800 rounded-2xl p-6'
          >
            <div className='text-zinc-500 text-xs uppercase tracking-wide'>
              {item.title}
            </div>

            <div className='text-5xl font-black text-white mt-4'>
              {item.value}
            </div>

            <div className='text-zinc-400 mt-4 leading-relaxed'>
              {item.detail}
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8 border border-amber-500/10 bg-amber-500/5 rounded-2xl p-6'>
        <div className='text-amber-300 font-bold text-lg'>
          AI Executive Summary
        </div>

        <div className='text-zinc-300 mt-3 leading-relaxed'>
          Procurement volatility indicators increased across aerospace and machined component suppliers during the last operational cycle. Recommended actions include sourcing diversification, lead-time escalation reviews, and strategic quote consolidation.
        </div>
      </div>
    </div>
  );
}
