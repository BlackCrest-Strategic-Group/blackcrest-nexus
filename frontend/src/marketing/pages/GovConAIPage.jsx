import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import Section from "../components/Section.jsx";
import CTASection from "../components/CTASection.jsx";
import { APP_URL } from "../constants.js";
import "../marketing.css";

export default function GovConAIPage() {
  return (
    <div className="mkt">
      <Navbar />

      <Hero
        eyebrow="GovCon AI — Pre-Award Intelligence"
        title={<>Win smarter<br />before you bid</>}
        subtitle="AI-powered opportunity evaluation, RFP analysis, compliance scanning, and bid/no-bid decision support — purpose-built for federal contractors."
        actions={[
          { label: "Request Demo", href: "mailto:demo@blackcrestai.com" },
          { label: "Open App", href: APP_URL, variant: "outline" },
        ]}
      />

      {/* ── Core capabilities ── */}
      <Section
        eyebrow="Capabilities"
        title="Everything you need before you write a single word"
        subtitle="GovCon AI automates the intelligence work that typically takes days of manual review."
        variant="darker"
      >
        <div className="mkt-grid mkt-grid--2">
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">📄</div>
            <div className="mkt-feature-card__title">RFP Analysis</div>
            <p className="mkt-feature-card__text">
              Upload any RFP, solicitation, or draft PWS and get an AI-structured breakdown of
              requirements, evaluation criteria, key dates, and potential risk areas — in minutes,
              not days.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">🔍</div>
            <div className="mkt-feature-card__title">Compliance Scanning</div>
            <p className="mkt-feature-card__text">
              Automatically scan for FAR, DFARS, and agency-specific compliance requirements.
              Surface gaps between what's required and what your current capabilities can support
              before the bid.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">⚖️</div>
            <div className="mkt-feature-card__title">Bid / No-Bid Decisions</div>
            <p className="mkt-feature-card__text">
              Replace gut-feel bid decisions with a structured, AI-scored assessment. Evaluate
              opportunity fit, past performance alignment, resource requirements, and competitive
              position in a single view.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">✍️</div>
            <div className="mkt-feature-card__title">Proposal Support</div>
            <p className="mkt-feature-card__text">
              Generate proposal outlines, section frameworks, and win-theme recommendations
              aligned to the specific evaluation criteria in your target solicitation.
            </p>
          </div>
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section
        eyebrow="How It Works"
        title="A structured process for every opportunity"
        subtitle="GovCon AI gives your team a repeatable, AI-assisted workflow from opportunity identification to proposal submission."
      >
        <div className="mkt-grid mkt-grid--3">
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">1</div>
            <div className="mkt-feature-card__title">Identify</div>
            <p className="mkt-feature-card__text">
              Monitor SAM.gov and curated opportunity feeds. GovCon AI surfaces opportunities
              aligned to your NAICS codes, capabilities, and past performance profile.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">2</div>
            <div className="mkt-feature-card__title">Evaluate</div>
            <p className="mkt-feature-card__text">
              Run the opportunity through AI-powered RFP analysis and compliance scanning.
              Get a structured bid/no-bid score with supporting rationale your team can act on.
            </p>
          </div>
          <div className="mkt-feature-card">
            <div className="mkt-feature-card__icon">3</div>
            <div className="mkt-feature-card__title">Pursue</div>
            <p className="mkt-feature-card__text">
              For bids worth pursuing, generate proposal outlines, draft section frameworks,
              and organize your team's submission effort with AI-generated structure.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Platform detail ── */}
      <Section
        eyebrow="Platform"
        title="Built for GovCon teams operating at scale"
        subtitle="GovCon AI integrates into your existing workflow without requiring a complete process overhaul."
        variant="darker"
      >
        <div className="mkt-two-col">
          <div className="mkt-two-col__content">
            <div className="mkt-two-col__eyebrow">Opportunity Intelligence</div>
            <div className="mkt-two-col__title">
              Stop reviewing every solicitation manually
            </div>
            <p className="mkt-two-col__text">
              GovCon AI processes the full text of a solicitation and returns a structured
              summary with highlighted risk areas, required certifications, and evaluation
              weight breakdowns — so your team can make a decision in minutes, not days.
            </p>
            <ul className="mkt-features">
              <li>Automated requirement extraction</li>
              <li>Evaluation factor weight analysis</li>
              <li>Certification &amp; registration requirement flagging</li>
              <li>Key date extraction &amp; timeline building</li>
            </ul>
          </div>
          <div className="mkt-two-col__visual">
            <div className="mkt-lifecycle__label">Opportunity Score</div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#22d3ee", lineHeight: 1 }}>87</div>
            <div style={{ fontSize: "13px", color: "var(--bc-text-secondary)" }}>Strong Fit — Recommend Pursue</div>
            <hr className="mkt-divider" style={{ borderColor: "var(--bc-border)" }} />
            <ul className="mkt-features">
              <li>NAICS alignment: Strong</li>
              <li>Past performance match: 4 of 5</li>
              <li>Compliance gaps: 2 (addressable)</li>
              <li>Competitive landscape: Favorable</li>
            </ul>
          </div>
        </div>
      </Section>

      <CTASection
        title="Ready to win smarter?"
        subtitle="See GovCon AI in action with a live demo or open the app and start evaluating opportunities today."
        actions={[
          { label: "Request Demo", href: "mailto:demo@blackcrestai.com" },
          { label: "Open App", href: APP_URL, variant: "outline" },
        ]}
      />

      <Footer />
    </div>
  );
}
