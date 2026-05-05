import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';

const modules = [
  {
    title: 'Procurement Intelligence',
    outcome: 'Shorten sourcing cycles from weeks to days.',
    description: 'Centralize supplier visibility, RFQ workflows, sourcing activity, spend intelligence, and procurement operations in one environment.',
    path: '/procurement-intelligence'
  },
  {
    title: 'Truth Serum',
    outcome: 'Detect operational blind spots before they become financial problems.',
    description: 'Analyze procurement signals, supplier volatility, operational KPIs, and sourcing anomalies before they escalate.',
    path: '/truth-serum'
  },
  {
    title: 'Sentinel',
    outcome: 'Bring governance and operational oversight into one environment.',
    description: 'Centralize AI governance, procurement oversight, operational accountability, and executive visibility across workflows.',
    path: '/sentinel'
  }
];

export default function HomePageV2() {
  return (
    <MarketingLayout>
      <SeoHead
        title='BlackCrest Nexus | Procurement Intelligence for Industrial Operations'
        description='BlackCrest combines procurement intelligence, supplier visibility, operational analytics, and governance into one operational platform.'
        canonicalPath='/'
      />

      <main>
        <section className='hero-section container enterprise-hero'>
          <p className='eyebrow'>BLACKCREST PROCUREMENT INTELLIGENCE</p>

          <h1>Procurement Intelligence Built for Real Operations.</h1>

          <p>
            Cut sourcing cycle time, improve supplier visibility, reduce operational blind spots, and centralize procurement intelligence in one platform.
          </p>

          <div className='row' style={{ gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <Link className='btn' to='/contact'>
              Request Executive Demo
            </Link>

            <Link className='btn ghost' to='/features'>
              See How It Works
            </Link>
          </div>
        </section>

        <section className='container section-grid capability-grid'>
          {modules.map((module) => (
            <article key={module.title} className='marketing-card'>
              <h2>{module.title}</h2>

              <p style={{ fontWeight: 700 }}>{module.outcome}</p>

              <p>{module.description}</p>

              <div className='row' style={{ gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <Link className='btn' to='/contact'>
                  Request Demo
                </Link>

                <Link className='btn ghost' to={module.path}>
                  Explore Module
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </MarketingLayout>
  );
}
