import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import Section from "../components/Section.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CTASection from "../components/CTASection.jsx";
import { APP_URL } from "../constants.js";
import "../marketing.css";

export default function BlackCrestAIPage() {
  return (
    <div className="mkt">
      <Navbar />

      <Hero
        eyebrow="BlackCrest AI"
        title={<>Enterprise AI for the full<br /><span>contract lifecycle</span></>}
        subtitle="Procurement intelligence, contract strategy, and execution monitoring — built for defense contractors, manufacturers, and B2B organizations operating at scale."
        actions={[
          { label: "GovCon AI", href: "/blackcrest-ai/govcon-ai" },
          { label: "Truth Serum AI", href: "/blackcrest-ai/truth-serum-ai", variant: "outline" },
        ]}
      />

      {/* ── Products ── */}
      <Section
        eyebrow="Products"
        title="Two products. Complete coverage."
        subtitle="BlackCrest AI addresses both sides of the contract intelligence problem."
        variant="darker"
      >
        <div className="mkt-grid mkt-grid--2">
          <ProductCard
            icon="🎯"
            badge="Pre-Award"
            title="GovCon AI"
            description="Win smarter before you bid. AI-powered opportunity evaluation, RFP analysis, compliance scanning, and proposal support for federal contractors who need an edge on every submission."
            href="/blackcrest-ai/govcon-ai"
            linkLabel="See GovCon AI"
          />
          <ProductCard
            icon="🩻"
            badge="Post-Award"
            title="Truth Serum AI"
            description="Expose what's really happening after award. Read-only ERP visibility and operational data intelligence that surfaces supplier misses, margin risk, and execution drift in real time."
            href="/blackcrest-ai/truth-serum-ai"
            linkLabel="See Truth Serum AI"
          />
        </div>
      </Section>

      {/* ── Lifecycle section ── */}
      <Section
        eyebrow="Contract Lifecycle Intelligence"
        title="From Opportunity to Execution Truth"
        subtitle="Most enterprise software handles either pre-award or post-award. BlackCrest AI handles both."
      >
        <div className="mkt-lifecycle">
          <div className="mkt-lifecycle__col">
            <div className="mkt-lifecycle__label">Phase 1 — Pre-Award</div>
            <div className="mkt-lifecycle__title">Find &amp; Win</div>
            <p className="mkt-lifecycle__desc">
              GovCon AI gives your team a structured, AI-driven process for evaluating every federal
              opportunity before a single line of proposal is written. Eliminate guesswork.
              Allocate resources on bids you can win.
            </p>
            <ul className="mkt-features">
              <li>SAM.gov opportunity monitoring</li>
              <li>RFP analysis &amp; requirement extraction</li>
              <li>Automated compliance gap scanning</li>
              <li>Bid / No-Bid decision scoring</li>
              <li>Proposal outline &amp; support generation</li>
            </ul>
          </div>

          <div className="mkt-lifecycle__divider">
            <div className="mkt-lifecycle__divider-line" />
            <div className="mkt-lifecycle__divider-dot" />
            <div className="mkt-lifecycle__divider-line" />
          </div>

          <div className="mkt-lifecycle__col">
            <div className="mkt-lifecycle__label">Phase 2 — Post-Award</div>
            <div className="mkt-lifecycle__title">Execute &amp; Monitor</div>
            <p className="mkt-lifecycle__desc">
              Truth Serum AI connects to your existing ERP in read-only mode and generates
              an operational intelligence layer over your contract execution. Catch problems
              before they become contract failures.
            </p>
            <ul className="mkt-features">
              <li>Read-only ERP integration</li>
              <li>Supplier performance visibility</li>
              <li>Contract health monitoring</li>
              <li>Margin risk &amp; cost variance detection</li>
              <li>Delivery integrity &amp; schedule tracking</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Who it's for ── */}
      <Section
        eyebrow="Built For"
        title="Credible for enterprise buyers"
        subtitle="BlackCrest AI is purpose-built for organizations operating in complex procurement environments."
        variant="darker"
      >
        <div className="mkt-grid mkt-grid--4">
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">🏭</div>
            <div className="mkt-feature-card__title">Defense Contractors</div>
            <p className="mkt-feature-card__text">
              Navigate FAR/DFARS compliance, evaluate DoD opportunities, and manage complex
              post-award execution environments.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">⚙️</div>
            <div className="mkt-feature-card__title">Manufacturers</div>
            <p className="mkt-feature-card__text">
              Monitor supplier performance, track delivery integrity, and surface margin risk
              before production disruptions escalate.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">📋</div>
            <div className="mkt-feature-card__title">Procurement Teams</div>
            <p className="mkt-feature-card__text">
              Automate opportunity analysis and compliance review so your team focuses on
              strategy rather than document processing.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">📈</div>
            <div className="mkt-feature-card__title">B2B Organizations</div>
            <p className="mkt-feature-card__text">
              Scale your GovCon operation with AI-powered intelligence without scaling your
              headcount at the same rate.
            </p>
          </div>
        </div>
      </Section>

      <CTASection
        title="Start with the product that fits your need"
        subtitle="Whether you're evaluating opportunities before award or monitoring execution after — we have a product for you."
        actions={[
          { label: "GovCon AI — Pre-Award", href: "/blackcrest-ai/govcon-ai" },
          { label: "Truth Serum AI — Post-Award", href: "/blackcrest-ai/truth-serum-ai", variant: "outline" },
        ]}
      />

      <Footer />
    </div>
  );
}
