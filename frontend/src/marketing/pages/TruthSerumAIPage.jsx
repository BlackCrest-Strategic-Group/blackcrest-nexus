import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import Section from "../components/Section.jsx";
import CTASection from "../components/CTASection.jsx";
import { APP_URL } from "../constants.js";
import "../marketing.css";

export default function TruthSerumAIPage() {
  return (
    <div className="mkt">
      <Navbar />

      <Hero
        eyebrow="Truth Serum AI — Post-Award Intelligence"
        title={<>Expose what's really<br />happening after award</>}
        subtitle="Read-only ERP visibility and operational data intelligence that surfaces supplier misses, delayed receipts, execution drift, and margin risk — before they become contract failures."
        actions={[
          { label: "Request Demo", href: "mailto:demo@blackcrestai.com" },
          { label: "Learn About Platform", href: "/blackcrest-ai", variant: "outline" },
        ]}
      />

      {/* ── Core capabilities ── */}
      <Section
        eyebrow="Capabilities"
        title="Operational intelligence your ERP won't show you"
        subtitle="Truth Serum AI layers AI-powered analysis on top of your existing ERP data — no migration, no disruption, no write access."
        variant="darker"
      >
        <div className="mkt-grid mkt-grid--2">
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">🏭</div>
            <div className="mkt-feature-card__title">Supplier Truth</div>
            <p className="mkt-feature-card__text">
              See your suppliers the way your contract requires. Track on-time delivery rates,
              quality reject patterns, and response times across your entire supplier network —
              with AI-generated risk flags for underperformers.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">📊</div>
            <div className="mkt-feature-card__title">Contract Health</div>
            <p className="mkt-feature-card__text">
              Monitor the live health of every active contract. Get an AI-scored contract
              health index that combines schedule adherence, cost variance, and supplier
              performance into a single decision-ready view.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">💰</div>
            <div className="mkt-feature-card__title">Margin Risk</div>
            <p className="mkt-feature-card__text">
              Detect cost overruns, labor variance, and material cost drift before they erode
              your margin. Truth Serum compares actuals against contract baselines and flags
              anomalies before they compound.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">🚚</div>
            <div className="mkt-feature-card__title">Delivery Integrity</div>
            <p className="mkt-feature-card__text">
              Track every open purchase order and supplier commitment against your master
              schedule. Get predictive alerts when delivery patterns suggest an upcoming miss
              before it hits your production floor.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Read-only ERP explainer ── */}
      <Section
        eyebrow="How It Works"
        title="Read-only ERP visibility — zero disruption"
        subtitle="Truth Serum AI connects to your existing ERP in a read-only capacity. Your data stays in your systems. We surface the intelligence."
      >
        <div className="mkt-two-col">
          <div className="mkt-two-col__content">
            <div className="mkt-two-col__eyebrow">Non-invasive by design</div>
            <div className="mkt-two-col__title">
              Connect without changing how you operate
            </div>
            <p className="mkt-two-col__text">
              Truth Serum AI is a read-only intelligence layer. It connects to your ERP
              (SAP, Oracle, Epicor, and others) through secure read-only API integration,
              extracts relevant operational data, and runs continuous AI analysis without
              modifying a single record or requiring process changes from your team.
            </p>
            <ul className="mkt-features">
              <li>Read-only API integration — no write access, ever</li>
              <li>Works with existing ERP systems without migration</li>
              <li>No changes required to your current workflows</li>
              <li>Secure, audited data access with full transparency</li>
            </ul>
          </div>
          <div className="mkt-two-col__visual">
            <div className="mkt-lifecycle__label">Contract Health Index</div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#ef4444", lineHeight: 1 }}>62</div>
            <div style={{ fontSize: "13px", color: "var(--bc-text-secondary)" }}>At Risk — Intervention Recommended</div>
            <hr className="mkt-divider" style={{ borderColor: "var(--bc-border)" }} />
            <ul className="mkt-features">
              <li>Schedule adherence: 81% (declining)</li>
              <li>Cost variance: +7.4% over baseline</li>
              <li>Supplier miss rate: 3 of 8 critical suppliers</li>
              <li>Margin erosion risk: High</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Who it's for ── */}
      <Section
        eyebrow="Use Cases"
        title="Built for organizations where execution risk is financial risk"
        subtitle="Truth Serum AI is designed for contract-driven businesses where what happens after award directly impacts profit and customer relationships."
        variant="darker"
      >
        <div className="mkt-grid mkt-grid--3">
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">🛡️</div>
            <div className="mkt-feature-card__title">Defense Prime Contractors</div>
            <p className="mkt-feature-card__text">
              Monitor complex multi-tier subcontractor networks against program schedules.
              Catch execution drift before it triggers CPARS evaluations or customer escalations.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">⚙️</div>
            <div className="mkt-feature-card__title">Contract Manufacturers</div>
            <p className="mkt-feature-card__text">
              Track supplier on-time delivery and quality performance against your production
              commitments. Never be surprised by a supplier miss on your shop floor again.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">📋</div>
            <div className="mkt-feature-card__title">Program Managers</div>
            <p className="mkt-feature-card__text">
              Replace manual status collection with a real-time contract health dashboard.
              Walk into every program review with data, not anecdotes.
            </p>
          </div>
        </div>
      </Section>

      <CTASection
        title="Stop flying blind after award"
        subtitle="Truth Serum AI surfaces the operational reality your ERP is hiding. Request a demo to see it with your data."
        actions={[
          { label: "Request Demo", href: "mailto:demo@blackcrestai.com" },
          { label: "Learn About Platform", href: "/blackcrest-ai", variant: "outline" },
        ]}
      />

      <Footer />
    </div>
  );
}
