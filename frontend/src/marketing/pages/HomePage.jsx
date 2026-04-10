import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import Section from "../components/Section.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CTASection from "../components/CTASection.jsx";
import { APP_URL } from "../constants.js";
import "../marketing.css";

export default function HomePage() {
  return (
    <div className="mkt">
      <Navbar />

      <Hero
        eyebrow="BlackCrest Strategic Group"
        title={<>Win smarter. Execute better.<br />Uncover what's hidden.</>}
        subtitle="AI systems built for procurement, GovCon, contract strategy, and post-award operational intelligence."
        actions={[
          { label: "Explore BlackCrest AI", href: "/blackcrest-ai" },
          { label: "Open App", href: APP_URL, variant: "outline" },
        ]}
      />

      {/* ── Divisions ── */}
      <Section
        eyebrow="Our Divisions"
        title="Two brands. One strategic mission."
        subtitle="BlackCrest Strategic Group operates two distinct divisions built for different buyer contexts."
        variant="darker"
      >
        <div className="mkt-grid mkt-grid--2">
          <ProductCard
            icon="⬛"
            badge="Enterprise"
            title="BlackCrest AI"
            description="Enterprise AI for procurement, contract strategy, and execution intelligence. Built for defense contractors, manufacturing firms, and B2B organizations operating in complex federal and commercial markets."
            href="/blackcrest-ai"
            linkLabel="Explore BlackCrest AI"
          />
          <ProductCard
            icon="🔬"
            badge="Experimental"
            title="LoudMouth Mike Labs"
            description="The creative and experimental division. Consumer-facing builds, digital products with personality, and ideas that don't fit anywhere else. Organized chaos, delivered with precision."
            href="/labs"
            linkLabel="Visit the Labs"
          />
        </div>
      </Section>

      {/* ── Featured Products ── */}
      <Section
        eyebrow="Featured Products"
        title="Intelligence for every phase of the contract lifecycle"
        subtitle="From the moment you find an opportunity to the moment you close it out — BlackCrest AI has you covered."
      >
        <div className="mkt-grid mkt-grid--2">
          <ProductCard
            icon="🎯"
            badge="Pre-Award"
            title="GovCon AI"
            description="Win smarter before you bid. Analyze RFPs, scan for compliance requirements, make confident bid/no-bid decisions, and generate proposal frameworks — all before you write a single word."
            href="/blackcrest-ai/govcon-ai"
            linkLabel="Learn about GovCon AI"
          />
          <ProductCard
            icon="🩻"
            badge="Post-Award"
            title="Truth Serum AI"
            description="Expose what's really happening after award. Read-only ERP visibility and operational data that surfaces supplier misses, delayed receipts, execution drift, and margin risk before they become problems."
            href="/blackcrest-ai/truth-serum-ai"
            linkLabel="Learn about Truth Serum AI"
          />
        </div>
      </Section>

      {/* ── Lifecycle ── */}
      <Section
        eyebrow="End-to-End Intelligence"
        title="From Opportunity to Execution Truth"
        subtitle="Most companies operate blind at both ends of the contract lifecycle. BlackCrest AI closes both gaps."
        variant="darker"
      >
        <div className="mkt-lifecycle">
          <div className="mkt-lifecycle__col">
            <div className="mkt-lifecycle__label">Pre-Award</div>
            <div className="mkt-lifecycle__title">GovCon AI</div>
            <p className="mkt-lifecycle__desc">
              Evaluate federal opportunities with AI-powered RFP analysis, automated compliance scanning,
              structured bid/no-bid scoring, and proposal support tools. Stop guessing. Start winning.
            </p>
            <ul className="mkt-features">
              <li>RFP Analysis &amp; Requirement Extraction</li>
              <li>Compliance Gap Scanning</li>
              <li>Bid / No-Bid Decision Engine</li>
              <li>Proposal Support &amp; Outline Generation</li>
            </ul>
          </div>

          <div className="mkt-lifecycle__divider">
            <div className="mkt-lifecycle__divider-line" />
            <div className="mkt-lifecycle__divider-dot" />
            <div className="mkt-lifecycle__divider-line" />
          </div>

          <div className="mkt-lifecycle__col">
            <div className="mkt-lifecycle__label">Post-Award</div>
            <div className="mkt-lifecycle__title">Truth Serum AI</div>
            <p className="mkt-lifecycle__desc">
              After award, most companies lose visibility. Truth Serum connects to your existing ERP
              in read-only mode and surfaces operational risk before it becomes a contract failure.
            </p>
            <ul className="mkt-features">
              <li>Supplier Performance Monitoring</li>
              <li>Contract Health &amp; Delivery Integrity</li>
              <li>Margin Risk Detection</li>
              <li>Execution Drift Alerts</li>
            </ul>
          </div>
        </div>
      </Section>

      <CTASection
        title="Ready to see it in action?"
        subtitle="Explore the BlackCrest AI platform or open the GovCon AI app directly."
        actions={[
          { label: "Explore BlackCrest AI", href: "/blackcrest-ai" },
          { label: "Open App", href: APP_URL, variant: "outline" },
        ]}
      />

      <Footer />
    </div>
  );
}
