import { motion } from 'framer-motion';

const trustItems = ['Built for Modern Procurement Teams', 'Operational Intelligence', 'Supplier Visibility', 'AI-Assisted Analysis', 'ERP Connectivity'];

const platformCards = [
  ['Proposal Intelligence', 'Accelerate review cycles with clause extraction, requirement mapping, and confidence scoring.'],
  ['Supplier Risk Monitoring', 'Track financial, compliance, and delivery volatility with proactive alerts.'],
  ['Executive Dashboards', 'Board-ready command views for savings, risk, throughput, and forecast variance.'],
  ['Strategic Sourcing', 'Coordinate sourcing events, negotiation playbooks, and award recommendations.'],
  ['Category Management', 'Build category strategies with market pulse, benchmarks, and supplier concentration insight.'],
  ['Marketplace Connectivity', 'Activate qualified supplier discovery with capability, location, and certification filters.'],
  ['Funding & Capital Bridge', 'Connect procurement execution to working capital pathways and financing readiness.']
];

const workflow = ['Upload', 'Analyze', 'Source', 'Evaluate', 'Execute', 'Monitor'];

const screenshots = ['Executive Dashboard', 'Supplier Analytics', 'Proposal Review Engine', 'Marketplace View', 'ERP Integration Center'];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function App() {
  return (
    <div className="min-h-screen bg-[#060606] text-[#f5f5f5] scroll-smooth">
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/65">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-[0.2em]">BLACKCREST NEXUS</div>
          <div className="hidden gap-8 text-sm text-gray-300 md:flex"><a href="#platform">Platform</a><a href="#workflow">Workflow</a><a href="#demo">Demo</a></div>
          <button className="rounded-full border border-[#c8a96b]/50 px-4 py-2 text-sm text-[#c8a96b]">Book Demo</button>
        </nav>
      </header>

      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,169,107,0.16),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-2">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.7 }}>
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#c8a96b]">Procurement Intelligence Operating System</p>
              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Procurement Intelligence That Turns Operational Chaos Into Action</h1>
              <p className="mt-6 max-w-xl text-lg text-gray-300">Unify sourcing, supplier intelligence, proposal workflows, analytics, and executive visibility into one operational platform.</p>
              <div className="mt-8 flex flex-wrap gap-4"><button className="rounded-full bg-[#c8a96b] px-6 py-3 font-medium text-black">Book Demo</button><button className="rounded-full border border-white/30 px-6 py-3">View Platform</button></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_0_60px_rgba(200,169,107,0.2)] backdrop-blur">
              <div className="aspect-video rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-black/40 p-6">
                <div className="h-full w-full rounded-lg border border-dashed border-[#c8a96b]/40 grid place-items-center text-gray-300">Cinematic Product Demo Placeholder</div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0d0d0d] py-5 overflow-hidden">
          <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 25, ease: 'linear' }} className="flex gap-10 whitespace-nowrap text-sm text-gray-300">
            {[...trustItems, ...trustItems].map((item, i) => <span key={i} className="inline-flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-[#c8a96b]" />{item}</span>)}
          </motion.div>
        </section>

        <section id="platform" className="mx-auto max-w-7xl px-6 py-24">
          <h2 className="mb-10 text-3xl font-semibold">Platform Overview</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {platformCards.map(([title, desc], i) => (
              <motion.article key={title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#c8a96b]/50 hover:shadow-[0_0_40px_rgba(200,169,107,0.15)]">
                <div className="mb-3 h-9 w-9 rounded-lg bg-[#c8a96b]/15" />
                <h3 className="mb-2 font-medium">{title}</h3><p className="text-sm text-gray-400">{desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24"><div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-8"><h2 className="mb-6 text-3xl font-semibold">Interactive Procurement Command View</h2><div className="grid gap-4 md:grid-cols-3">{['Supplier Risk Heatmap','Savings Trend Chart','Sourcing Pipeline','Operational Metrics','Procurement KPIs','Glowing Alert Feed'].map((w)=><div key={w} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="mb-3 h-24 rounded bg-gradient-to-r from-[#c8a96b]/30 to-transparent"/><p className="text-sm text-gray-300">{w}</p></div>)}</div></div></section>

        <section id="workflow" className="mx-auto max-w-7xl px-6 pb-24"><h2 className="mb-8 text-3xl font-semibold">Procurement Workflow</h2><div className="grid gap-4 md:grid-cols-6">{workflow.map((step, i)=><div key={step} className="relative rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center"><p className="text-[#c8a96b]">0{i+1}</p><p>{step}</p></div>)}</div></section>

        <section className="mx-auto max-w-7xl px-6 pb-24"><h2 className="mb-8 text-3xl font-semibold">Platform Screens</h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{screenshots.map((s)=><div key={s} className="group rounded-2xl border border-white/10 p-2"><div className="aspect-video rounded-xl border border-[#c8a96b]/25 bg-gradient-to-br from-white/5 to-black grid place-items-center transition group-hover:scale-[1.02]">{s}</div></div>)}</div></section>

        <section className="mx-auto max-w-7xl px-6 pb-24"><div className="grid gap-6 md:grid-cols-3">{['Operational Visibility','Faster Procurement Decisions','Enterprise Intelligence Layer'].map((item)=><div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="mb-4 h-10 w-10 rounded-full bg-[#c8a96b]/20"/><h3 className="mb-2 text-xl">{item}</h3><p className="text-gray-400">Purpose-built for procurement leaders who need decision-grade signals, not disconnected dashboards.</p></div>)}</div></section>

        <section id="demo" className="mx-auto max-w-7xl px-6 pb-24"><h2 className="mb-8 text-3xl font-semibold text-center">See BlackCrest Nexus In Action</h2><div className="aspect-video rounded-2xl border border-white/10 bg-white/[0.03] grid place-items-center">Autoplay muted loop demo placeholder</div></section>

        <section className="mx-auto max-w-5xl px-6 pb-24 text-center"><h2 className="text-4xl font-semibold">The Future of Procurement Is Operational Intelligence.</h2><div className="mt-8 flex justify-center gap-4"><button className="rounded-full bg-[#c8a96b] px-6 py-3 text-black">Schedule Demo</button><button className="rounded-full border border-white/30 px-6 py-3">Explore Platform</button></div></section>
      </main>

      <footer className="border-t border-white/10 px-6 py-10 text-sm text-gray-400"><div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-[#f5f5f5]">BLACKCREST NEXUS</p><p>Procurement Intelligence Operating System</p></div><div className="flex gap-6"><a href="#">Platform</a><a href="#">LinkedIn</a><a href="mailto:contact@blackcrestnexus.com">contact@blackcrestnexus.com</a></div><p>© 2026 BlackCrest Nexus</p></div></footer>
    </div>
  );
}
