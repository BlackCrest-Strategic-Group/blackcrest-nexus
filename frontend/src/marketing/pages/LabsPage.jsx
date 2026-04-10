import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import Section from "../components/Section.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CTASection from "../components/CTASection.jsx";
import "../marketing.css";

export default function LabsPage() {
  return (
    <div className="mkt mkt-labs">
      <Navbar />

      <Hero
        eyebrow="LoudMouth Mike Labs"
        title={<>Experimental digital products<br />with <span>personality</span></>}
        subtitle="The creative and experimental division of BlackCrest Strategic Group. Consumer-facing builds, weird ideas executed well, and products that don't fit anywhere else."
        actions={[
          { label: "What We're Building", href: "#projects" },
        ]}
      />

      {/* ── What is Labs ── */}
      <Section
        eyebrow="About the Labs"
        title="Organized chaos, delivered with precision"
        subtitle="LoudMouth Mike Labs is where ideas that are too creative, too consumer-facing, or too experimental for the enterprise side come to life."
        variant="darker"
      >
        <div className="mkt-two-col">
          <div className="mkt-two-col__content">
            <div className="mkt-two-col__eyebrow">The Labs Ethos</div>
            <div className="mkt-two-col__title">
              Build things people actually want to use
            </div>
            <p className="mkt-two-col__text">
              The enterprise side of BlackCrest is built for procurement officers and program
              managers. The Labs side is built for everyone else. We make digital products
              with personality — consumer apps, creative tools, and experimental builds that
              prioritize experience over complexity.
            </p>
            <p className="mkt-two-col__text">
              Everything that comes out of LoudMouth Mike Labs is still organized, polished,
              and built to last. We just don't wear a suit when we ship it.
            </p>
          </div>
          <div className="mkt-two-col__visual">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="mkt-two-col__eyebrow">Labs Principles</div>
              <ul className="mkt-features">
                <li>Personality over polish — but deliver both</li>
                <li>Ship fast, iterate in public</li>
                <li>Consumer UX over enterprise complexity</li>
                <li>Creative first, strategic second</li>
                <li>Build things that make people laugh or think</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Projects ── */}
      <Section
        id="projects"
        eyebrow="What We're Building"
        title="Current &amp; upcoming projects"
        subtitle="The Labs builds consumer-facing products and experimental digital experiences."
      >
        <div id="projects" className="mkt-grid mkt-grid--3">
          <ProductCard
            icon="🎙️"
            badge="Active"
            title="LoudMouth Mike"
            description="The flagship product that started it all. Digital personality tools, creative content generators, and consumer apps built with a distinct voice and unfiltered perspective."
            accentClass="mkt-card--accent-purple"
          />
          <ProductCard
            icon="🧪"
            badge="Experimental"
            title="Open Lab Projects"
            description="Rotating experiments and side builds that may ship as standalone products, get folded into existing tools, or get scrapped because they were terrible ideas. All of it is worth trying."
            accentClass="mkt-card--accent-amber"
          />
          <ProductCard
            icon="🔮"
            badge="Coming Soon"
            title="Consumer AI Tools"
            description="Lightweight AI-powered consumer tools built on the same underlying intelligence infrastructure as BlackCrest AI, but packaged for everyday use. More to come."
            accentClass="mkt-card--accent-pink"
          />
        </div>
      </Section>

      {/* ── Callout ── */}
      <section className="mkt-section mkt-section--darker">
        <div className="mkt-section__inner">
          <div className="mkt-labs-callout">
            <div style={{ fontSize: "40px" }}>🔬</div>
            <div className="mkt-labs-callout__title">
              The Labs is where the interesting stuff happens
            </div>
            <p className="mkt-labs-callout__text">
              Not every idea fits inside an enterprise product. The Labs exists so the good
              ones still get built. If you have an idea that belongs here, we want to hear it.
            </p>
            <a
              href="mailto:labs@blackcrestai.com"
              className="mkt-btn mkt-btn--primary"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* ── Relationship to BlackCrest ── */}
      <Section
        eyebrow="The Parent Company"
        title="Part of BlackCrest Strategic Group"
        subtitle="LoudMouth Mike Labs is one of two divisions under BlackCrest Strategic Group. The other is the enterprise side."
      >
        <div className="mkt-grid mkt-grid--2">
          <ProductCard
            icon="⬛"
            badge="Enterprise"
            title="BlackCrest AI"
            description="Enterprise AI for procurement, GovCon, and execution intelligence. Where LoudMouth Mike Labs is consumer-facing and creative, BlackCrest AI is precision-built for enterprise buyers."
            href="/blackcrest-ai"
            linkLabel="Explore BlackCrest AI"
          />
          <ProductCard
            icon="🎯"
            badge="Pre-Award"
            title="GovCon AI"
            description="The flagship GovCon product — AI-powered federal opportunity evaluation, RFP analysis, compliance scanning, and bid/no-bid decision support for federal contractors."
            href="/blackcrest-ai/govcon-ai"
            linkLabel="See GovCon AI"
          />
        </div>
      </Section>

      <CTASection
        title="Follow what's coming out of the Labs"
        subtitle="Get updates on new builds, experiments, and consumer product launches from LoudMouth Mike Labs."
        actions={[
          { label: "Contact the Labs", href: "mailto:labs@blackcrestai.com" },
          { label: "Back to Home", href: "/", variant: "outline" },
        ]}
      />

      <Footer />
    </div>
  );
}
