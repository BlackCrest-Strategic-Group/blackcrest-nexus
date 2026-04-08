import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── Brand colors ─────────────────────────────────────────────────────────────
// Primary navy:  #14243a
// Accent gold:   #c79d3b
// Ivory bg:      #f8f5f0
// Mid navy:      #1e3553

// ─── Pricing tiers ────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "free",
    name: "Starter",
    price: "$0",
    period: "/mo",
    badge: null,
    description: "Everything you need to find and evaluate federal contracts.",
    trial: "30-day full access, no credit card required",
    features: [
      "RFP Analysis — Unlimited",
      "Bid / No-Bid Decision — Unlimited",
      "SAM.gov Opportunity Scans — Unlimited",
      "Opportunity Intelligence Dashboard",
      "AI Bid Scoring",
    ],
    cta: "Request a Demo",
    ctaHref: "/login?mode=register&plan=free",
    highlight: false,
  },
  {
    id: "pro",
    name: "Professional",
    price: "$349",
    period: "/mo",
    badge: "Most Popular",
    description: "Advanced tools for growing GovCon teams ready to scale.",
    trial: "30-day free trial, then $349/mo",
    features: [
      "Everything in Starter",
      "ERP System Connection",
      "Team Collaboration (5 users)",
      "Full Capacity Read & Analysis",
      "Proposal Generator",
      "Supplier KPI Tracking (bid-specific)",
      "Supplier Suggestion Engine",
    ],
    cta: "Request a Demo",
    ctaHref: "/login?mode=register&plan=pro",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$595",
    period: "/mo",
    badge: null,
    description: "Unlimited scale for large contracting organizations.",
    trial: "30-day free trial, then $595/mo",
    features: [
      "Everything in Professional",
      "Unlimited Users",
      "Priority Support",
      "Custom Onboarding",
    ],
    cta: "Request a Demo",
    ctaHref: "/login?mode=register&plan=enterprise",
    highlight: false,
  },
];

// ─── Feature screenshots ──────────────────────────────────────────────────────
const SCREENSHOTS = [
  {
    id: 1,
    title: "SAM.gov Opportunity Search",
    description:
      "Instantly search, filter, and surface relevant federal contracting opportunities from SAM.gov. AI-ranked results mean you spend time on the right bids — not sifting through noise.",
    imgSrc: "/assets/screenshot-sam-search.png",
    fallback: true,
  },
  {
    id: 2,
    title: "Role-Based Dashboards",
    description:
      "Tailored dashboards for every stakeholder — Capture Managers, Procurement Officers, Operations Leads, and Executives each see the metrics that matter most to their role.",
    imgSrc: null,
    icon: "📊",
    color: "#1e3553",
  },
  {
    id: 3,
    title: "Opportunity Intelligence",
    description:
      "Deep-dive analytics on every opportunity: incumbent analysis, set-aside status, historical awards, agency spend patterns, and competitive landscape — all in one place.",
    imgSrc: null,
    icon: "🔍",
    color: "#14243a",
  },
  {
    id: 4,
    title: "Margin Leakage Analytics",
    description:
      "Identify cost overruns, margin erosion, and capacity mismatches before they become problems. Connect your ERP data for real-time financial intelligence on every contract.",
    imgSrc: null,
    icon: "📈",
    color: "#1e3553",
  },
];

// ─── How it works steps ───────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { step: "01", icon: "🔎", title: "Scan", description: "Connect to SAM.gov and let AI surface the most relevant opportunities for your NAICS codes and capabilities." },
  { step: "02", icon: "⚖️", title: "Analyze", description: "Run instant Bid/No-Bid analysis powered by Truth Serum AI — backed by your capacity, past performance, and teaming data." },
  { step: "03", icon: "📝", title: "Propose", description: "Generate compliant, competitive proposals with AI-assisted writing, supplier identification, and ERP-backed pricing." },
  { step: "04", icon: "🏆", title: "Win", description: "Track every submission, monitor award decisions, and continuously improve your win-rate with AI-driven post-award insights." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg className="flex-shrink-0 w-4 h-4" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#c79d3b" fillOpacity="0.15" />
      <path d="M6 10l3 3 5-5" stroke="#c79d3b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldLogo({ size = 64, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none" style={{ opacity }} aria-hidden="true">
      <path
        d="M50 4L8 22v32c0 26 18 50 42 58 24-8 42-32 42-58V22L50 4z"
        fill="#14243a"
        stroke="#c79d3b"
        strokeWidth="3"
      />
      <path
        d="M50 16L18 30v24c0 19 13 37 32 43 19-6 32-24 32-43V30L50 16z"
        fill="#1e3553"
      />
      <text x="50" y="68" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#ffffff">
        G
      </text>
      <circle cx="32" cy="42" r="3" fill="#c79d3b" />
      <circle cx="68" cy="42" r="3" fill="#c79d3b" />
      <circle cx="32" cy="74" r="3" fill="#c79d3b" />
      <circle cx="68" cy="74" r="3" fill="#c79d3b" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const pricingRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const goToRegister = (plan) => {
    navigate(`/login?mode=register&plan=${plan || "free"}`);
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        background: "#f8f5f0",
        color: "#14243a",
        overflowX: "hidden",
      }}
    >
      {/* ── Watermark overlay ───────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.045,
          width: 520,
          height: "auto",
        }}
      >
        <img
          src="/logos/blackcrest-logo.svg"
          alt=""
          style={{ width: "100%", height: "auto", filter: "grayscale(100%) brightness(0.4)" }}
        />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: isScrolled ? "rgba(20,36,58,0.97)" : "#14243a",
          backdropFilter: isScrolled ? "blur(8px)" : "none",
          boxShadow: isScrolled ? "0 2px 16px rgba(0,0,0,0.18)" : "none",
          transition: "all 0.25s ease",
          borderBottom: "1px solid rgba(199,157,59,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <ShieldLogo size={36} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", letterSpacing: 0.3 }}>
                GovCon
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: "#c79d3b", letterSpacing: 2, textTransform: "uppercase" }}>
                AI Scanner
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <button onClick={scrollToFeatures} style={navLinkStyle}>Features</button>
            <button onClick={scrollToPricing} style={navLinkStyle}>Pricing</button>
            <button onClick={goToLogin} style={navLinkStyle}>Sign In</button>
            <button
              onClick={() => goToRegister("free")}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                background: "#c79d3b",
                color: "#14243a",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.3,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = 0.9)}
              onMouseLeave={(e) => (e.target.style.opacity = 1)}
            >
              Request a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1e30 0%, #14243a 50%, #1e3553 100%)",
          position: "relative",
          overflow: "hidden",
          paddingTop: 100,
          paddingBottom: 120,
        }}
      >
        {/* Decorative circles */}
        <div aria-hidden="true" style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(199,157,59,0.06)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(199,157,59,0.04)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Shield + badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <ShieldLogo size={80} />
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(199,157,59,0.12)", border: "1px solid rgba(199,157,59,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
            <span style={{ fontSize: 11, color: "#c79d3b", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Powered by Truth Serum AI</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>for procurement professionals</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 60px)",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.12,
              marginBottom: 24,
              letterSpacing: -1,
            }}
          >
            Win More Federal Contracts
            <br />
            <span style={{ color: "#c79d3b" }}>with AI-Powered Intelligence</span>
          </h1>

          {/* Beta badge */}
          <div style={{ marginBottom: 24 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(199,157,59,0.15)",
                border: "1px solid rgba(199,157,59,0.35)",
                borderRadius: 100,
                padding: "5px 16px",
                fontSize: 13,
                color: "#c79d3b",
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800 }}>Beta</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>·</span>
              Currently in beta with <strong style={{ color: "#ffffff" }}>50 contractors</strong>
            </span>
          </div>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "rgba(255,255,255,0.72)",
              maxWidth: 680,
              margin: "0 auto 40px",
              lineHeight: 1.65,
            }}
          >
            GovCon AI Scanner gives your team an unfair advantage — instant RFP analysis, Bid/No-Bid decisions, SAM.gov intelligence, and proposal generation, all driven by Truth Serum AI.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 52 }}>
            <button
              onClick={() => goToRegister("free")}
              style={heroCTAStyle}
            >
              Request a Demo
            </button>
            <button
              onClick={scrollToFeatures}
              style={{
                padding: "14px 28px",
                borderRadius: 10,
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.6)")}
              onMouseLeave={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
            >
              See How It Works ↓
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
            {["30-Day Free Trial", "Stripe-Secured Billing", "SAM.gov Integrated", "TOTP MFA Security", "Cancel Anytime"].map((badge) => (
              <div key={badge} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#c79d3b" fillOpacity="0.2" /><path d="M4 7l2 2 4-4" stroke="#c79d3b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section style={{ background: "#14243a", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#c79d3b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Simple Process</p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#ffffff", marginBottom: 14 }}>From Scan to Contract in 4 Steps</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 560, margin: "0 auto" }}>Our AI-powered workflow removes the manual grunt-work so your team can focus on winning.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {HOW_IT_WORKS.map(({ step, icon, title, description }, i) => (
              <div key={step} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(199,157,59,0.15)", borderRadius: 14, padding: "28px 24px", position: "relative" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#c79d3b", letterSpacing: 2, marginBottom: 12 }}>STEP {step}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{description}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div aria-hidden="true" style={{ position: "absolute", right: -13, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "#c79d3b", display: "none" }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Screenshots ─────────────────────────────────────────────── */}
      <section ref={featuresRef} style={{ background: "#f8f5f0", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#c79d3b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Platform Features</p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#14243a", marginBottom: 14 }}>Everything Your GovCon Team Needs</h2>
            <p style={{ fontSize: 16, color: "#4a6080", maxWidth: 560, margin: "0 auto" }}>From opportunity discovery to proposal submission — all in one platform, powered by Truth Serum AI.</p>
          </div>

          {/* Screenshot tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 36 }}>
            {SCREENSHOTS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveScreenshot(i)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: `1.5px solid ${activeScreenshot === i ? "#14243a" : "rgba(20,36,58,0.18)"}`,
                  background: activeScreenshot === i ? "#14243a" : "transparent",
                  color: activeScreenshot === i ? "#ffffff" : "#14243a",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Active screenshot */}
          {SCREENSHOTS.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: activeScreenshot === i ? "grid" : "none",
                gridTemplateColumns: "1fr 1fr",
                gap: 48,
                alignItems: "center",
              }}
            >
              {/* Screenshot visual */}
              <div
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(20,36,58,0.15)",
                  background: s.color || "#1e3553",
                  minHeight: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.imgSrc ? (
                  <img
                    src={s.imgSrc}
                    alt={s.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: s.imgSrc ? "none" : "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: 320,
                    padding: 40,
                  }}
                >
                  <div style={{ fontSize: 64, marginBottom: 16 }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", textAlign: "center", opacity: 0.8 }}>{s.title}</div>
                  <div style={{ marginTop: 16, width: 48, height: 4, borderRadius: 2, background: "#c79d3b" }} />
                  {/* Placeholder UI elements */}
                  <div style={{ marginTop: 24, width: "80%", display: "flex", flexDirection: "column", gap: 8 }}>
                    {[85, 70, 92, 60].map((w, idx) => (
                      <div key={idx} style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.12)", width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={{ display: "inline-block", background: "rgba(199,157,59,0.12)", border: "1px solid rgba(199,157,59,0.25)", borderRadius: 100, padding: "4px 14px", marginBottom: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#c79d3b", letterSpacing: 1.5, textTransform: "uppercase" }}>Feature {String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#14243a", marginBottom: 16, lineHeight: 1.25 }}>{s.title}</h3>
                <p style={{ fontSize: 16, color: "#4a6080", lineHeight: 1.7, marginBottom: 28 }}>{s.description}</p>
                <button
                  onClick={() => goToRegister("free")}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 8,
                    background: "#14243a",
                    color: "#ffffff",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = 0.85)}
                  onMouseLeave={(e) => (e.target.style.opacity = 1)}
                >
                  Try It Free →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Truth Serum AI Banner ───────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #14243a 0%, #1e3553 100%)", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🧪</div>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, color: "#ffffff", marginBottom: 16 }}>
            Powered by{" "}
            <span style={{ color: "#c79d3b" }}>Truth Serum AI</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 10 }}>
            Truth Serum AI is our proprietary procurement intelligence engine — built from the ground up for federal contracting professionals. It ingests SAM.gov data, agency spend history, NAICS classifications, and your internal ERP data to surface the most accurate, unbiased intelligence available.
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
            For procurement professionals who demand the truth, not just the data.
          </p>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section ref={pricingRef} style={{ background: "#f8f5f0", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#c79d3b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Pricing</p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#14243a", marginBottom: 14 }}>Simple, Transparent Pricing</h2>
            <p style={{ fontSize: 16, color: "#4a6080", maxWidth: 480, margin: "0 auto" }}>
              All plans include a <strong>30-day free trial</strong> with full access. No credit card required to start.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "stretch" }}>
            {TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} onSelect={() => goToRegister(tier.id)} />
            ))}
          </div>

          <p style={{ textAlign: "center", marginTop: 36, fontSize: 13, color: "#4a6080" }}>
            All plans include a 30-day free trial. Paid plans are billed monthly via Stripe. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: "#f8f5f0", padding: "80px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#c79d3b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Security & Compliance</p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#14243a", marginBottom: 14 }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                q: "Is my data secure?",
                a: "Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). GovCon AI Scanner is built with compliance-minded buyers in mind — we never share, sell, or use your proprietary data to train third-party models. Your RFP documents, ERP data, and bid strategies stay yours, period. We operate on SOC 2-aligned infrastructure and support TOTP multi-factor authentication on every account.",
              },
              {
                q: "Can I use this with my existing ERP system?",
                a: "Yes. Professional and Enterprise plans include ERP system connections. We support major GovCon ERP platforms and provide secure, read-only API integrations so your financial data can power AI-driven pricing and margin analysis without compromising your systems.",
              },
              {
                q: "Who owns the proposals and analyses generated?",
                a: "You do. All outputs — including RFP analyses, Bid/No-Bid decisions, and generated proposals — are your intellectual property. We do not retain or use your content after your session.",
              },
            ].map(({ q, a }) => (
              <FAQItem key={q} question={q} answer={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How We Protect Your Data ────────────────────────────────────────── */}
      <section style={{ background: "#ffffff", padding: "80px 24px", borderTop: "4px solid #c79d3b" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(199,157,59,0.1)", border: "1px solid rgba(199,157,59,0.3)", borderRadius: 100, padding: "6px 18px", marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>🔒</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#c79d3b", letterSpacing: 1.5, textTransform: "uppercase" }}>Privacy & Security</span>
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#14243a", marginBottom: 12 }}>
              How We Protect Your Data
            </h2>
            <p style={{ fontSize: 15, color: "#4a6080", maxWidth: 560, margin: "0 auto" }}>
              Here's exactly what we do — and don't do — with your information.
            </p>
          </div>

          {/* Info box */}
          <div style={{ background: "#f8f5f0", border: "1px solid rgba(199,157,59,0.25)", borderRadius: 16, padding: "36px 40px", boxShadow: "0 4px 24px rgba(20,36,58,0.07)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                {
                  icon: "🗄️",
                  title: "Minimal Data Storage",
                  body: "We do not store any of your personal information unless you choose to register and sign in.",
                },
                {
                  icon: "🚫",
                  title: "No Tracking",
                  body: "Your activity is not tracked or shared. We only keep the minimum information required for you to use the application.",
                },
                {
                  icon: "⏱️",
                  title: "Session Privacy",
                  body: "When you use the app, your information (such as your name or email) is only stored temporarily during your session. Your password is never saved or exposed.",
                },
                {
                  icon: "🔑",
                  title: '"Remember Me" Optional',
                  body: 'If you choose "Remember Me" at login, a secure token is saved in your browser to keep you signed in; if not, all session information is removed when you close your browser.',
                },
                {
                  icon: "🎭",
                  title: "Demo Mode",
                  body: "You can explore the platform using our demo account — no personal information is required.",
                },
              ].map(({ icon, title, body }) => (
                <div key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 22, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <span style={{ fontWeight: 700, color: "#14243a", fontSize: 15 }}>{title}: </span>
                    <span style={{ color: "#4a6080", fontSize: 15, lineHeight: 1.6 }}>{body}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer statement */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(199,157,59,0.2)", textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#14243a", margin: 0 }}>
                Your privacy and security are our top priorities.{" "}
                <span style={{ fontWeight: 400, color: "#4a6080" }}>
                  We never share or sell your data, and we design our system to keep your information safe at all times.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section style={{ background: "#14243a", padding: "96px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <ShieldLogo size={64} />
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#ffffff", margin: "24px 0 16px", lineHeight: 1.15 }}>
            Ready to Win More Federal Contracts?
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", marginBottom: 40, lineHeight: 1.65 }}>
            Join GovCon teams already using Truth Serum AI to find, evaluate, and win government contracts faster than ever before.
          </p>
          <button onClick={() => goToRegister("free")} style={heroCTAStyle}>
            Request a Demo
          </button>
          <p style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            Schedule a personalized demo &bull; No commitment required &bull; Response within 1 business day
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#0d1e30", borderTop: "1px solid rgba(199,157,59,0.1)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldLogo size={30} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>GovCon AI Scanner</div>
              <div style={{ fontSize: 10, color: "#c79d3b", letterSpacing: 1.5, textTransform: "uppercase" }}>Powered by Truth Serum AI</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Features", "Pricing", "Sign In", "Request a Demo"].map((link) => (
              <button
                key={link}
                onClick={link === "Sign In" ? goToLogin : link === "Request a Demo" ? () => goToRegister("free") : link === "Pricing" ? scrollToPricing : scrollToFeatures}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                {link}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>
            © {new Date().getFullYear()} BlackCrest Strategic Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── FAQ item subcomponent ────────────────────────────────────────────────────
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1.5px solid rgba(20,36,58,0.12)",
        borderRadius: 12,
        background: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(20,36,58,0.05)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#14243a" }}>{question}</span>
        <span
          style={{
            fontSize: 20,
            color: "#c79d3b",
            fontWeight: 400,
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 24px 20px", borderTop: "1px solid rgba(20,36,58,0.07)" }}>
          <p style={{ fontSize: 14, color: "#4a6080", lineHeight: 1.7, margin: "16px 0 0" }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Pricing card subcomponent ────────────────────────────────────────────────
function PricingCard({ tier, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        borderRadius: 18,
        border: tier.highlight ? "2px solid #c79d3b" : "1.5px solid rgba(20,36,58,0.12)",
        background: tier.highlight ? "#14243a" : "#ffffff",
        padding: "36px 28px 32px",
        position: "relative",
        boxShadow: tier.highlight ? "0 20px 60px rgba(20,36,58,0.22)" : "0 4px 24px rgba(20,36,58,0.07)",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      {tier.badge && (
        <div
          style={{
            position: "absolute",
            top: -13,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#c79d3b",
            color: "#14243a",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: "uppercase",
            padding: "4px 16px",
            borderRadius: 100,
            whiteSpace: "nowrap",
          }}
        >
          {tier.badge}
        </div>
      )}

      {/* Plan name */}
      <p style={{ fontSize: 12, fontWeight: 700, color: tier.highlight ? "#c79d3b" : "#c79d3b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{tier.name}</p>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: tier.highlight ? "#ffffff" : "#14243a", lineHeight: 1 }}>{tier.price}</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: tier.highlight ? "rgba(255,255,255,0.55)" : "#4a6080", marginBottom: 6 }}>{tier.period}</span>
      </div>

      <p style={{ fontSize: 13, color: tier.highlight ? "rgba(255,255,255,0.55)" : "#4a6080", marginBottom: 6 }}>{tier.description}</p>

      {/* Trial note */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, padding: "8px 12px", borderRadius: 8, background: tier.highlight ? "rgba(199,157,59,0.1)" : "rgba(20,36,58,0.05)" }}>
        <span style={{ fontSize: 13 }}>🎁</span>
        <span style={{ fontSize: 12, color: tier.highlight ? "#c79d3b" : "#14243a", fontWeight: 600 }}>{tier.trial}</span>
      </div>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {tier.features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <CheckIcon />
            <span style={{ fontSize: 13.5, color: tier.highlight ? "rgba(255,255,255,0.85)" : "#2a3f55", lineHeight: 1.45 }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onSelect}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 10,
          border: tier.highlight ? "none" : "1.5px solid #14243a",
          background: tier.highlight ? "#c79d3b" : "transparent",
          color: tier.highlight ? "#14243a" : "#14243a",
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
          letterSpacing: 0.3,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = 0.85)}
        onMouseLeave={(e) => (e.target.style.opacity = 1)}
      >
        {tier.cta}
      </button>
    </div>
  );
}

// ─── Shared inline styles ─────────────────────────────────────────────────────
const navLinkStyle = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.72)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  padding: 0,
  fontFamily: "inherit",
  transition: "color 0.15s",
};

const heroCTAStyle = {
  padding: "15px 32px",
  borderRadius: 10,
  background: "#c79d3b",
  color: "#14243a",
  border: "none",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  letterSpacing: 0.3,
  boxShadow: "0 4px 20px rgba(199,157,59,0.3)",
  transition: "opacity 0.15s",
};
