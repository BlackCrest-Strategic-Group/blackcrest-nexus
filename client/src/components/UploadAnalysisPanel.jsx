export default function UploadAnalysisPanel() {
  const uploadSteps = [
    'Upload supplier quotes, RFQs, BOMs, or procurement spreadsheets',
    'AI extracts operational procurement intelligence',
    'Platform identifies sourcing risk and savings opportunities',
    'Executive summaries and supplier insights generated instantly',
  ];

  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-3xl p-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <div className='text-sm uppercase tracking-[0.3em] text-zinc-500'>
            AI Procurement Intelligence
          </div>

          <div className='text-4xl font-black text-amber-400 mt-2'>
            Analysis Engine
          </div>
        </div>

        <div className='px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold'>
          LIVE ANALYSIS
        </div>
      </div>

      <div className='border-2 border-dashed border-amber-500/20 rounded-2xl p-10 bg-black/30 text-center'>
        <div className='text-2xl font-bold text-white'>
          Drag and Drop Procurement Files
        </div>

        <div className='text-zinc-500 mt-3'>
          Supplier quotes, contracts, RFQs, spreadsheets, and procurement documents.
        </div>

        <button className='mt-8 bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-xl font-bold transition'>
          Upload Procurement Files
        </button>
      </div>

      <div className='grid md:grid-cols-2 gap-5 mt-8'>
        {uploadSteps.map((step, index) => (
          <div
            key={step}
            className='bg-black/40 border border-zinc-800 rounded-2xl p-5'
          >
            <div className='text-amber-400 font-black text-2xl'>
              0{index + 1}
            </div>

            <div className='text-zinc-300 mt-3 leading-relaxed'>
              {step}
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8 border border-emerald-500/20 bg-emerald-500/10 rounded-2xl p-6'>
        <div className='text-emerald-300 font-bold text-lg'>
          SAVINGS OPPORTUNITY DETECTED
        </div>

        <div className='text-zinc-300 mt-3 leading-relaxed'>
          Procurement analysis identified sourcing consolidation opportunities and pricing variance anomalies across active supplier quotes.
        </div>
      </div>
    </div>
  );
}
