const modules = [
  {
    title: 'NEXUS COMMAND',
    description:
      'Real-time procurement intelligence, supplier monitoring, and operational threat visibility.',
  },
  {
    title: 'SOURCEGRID',
    description:
      'AI-assisted sourcing workflows, RFQ acceleration, and supplier discovery operations.',
  },
  {
    title: 'TRUTH SERUM',
    description:
      'Deep procurement analysis engine for spreadsheets, supplier quotes, contracts, and operational data.',
  },
  {
    title: 'SENTINEL',
    description:
      'Enterprise governance, audit visibility, security alignment, and operational oversight.',
  },
];

export default function ModuleGrid() {
  return (
    <div className='grid lg:grid-cols-2 gap-6'>
      {modules.map((module) => (
        <div
          key={module.title}
          className='bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-amber-500/40 transition'
        >
          <div className='text-3xl font-black text-amber-400'>
            {module.title}
          </div>

          <div className='text-zinc-400 mt-5 leading-relaxed text-lg'>
            {module.description}
          </div>

          <div className='mt-8 inline-flex items-center gap-2 text-amber-300 font-semibold'>
            Operational Module Ready
          </div>
        </div>
      ))}
    </div>
  );
}
