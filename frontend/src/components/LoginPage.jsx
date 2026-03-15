import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../utils/api.js";
import { saveAuth } from "../utils/auth.js";

const NAICS_OPTIONS = [
  { code: "238290", label: "238290 – Other Building Equipment Contractors" },
  { code: "332710", label: "332710 – Machine Shops" },
  { code: "336411", label: "336411 – Aircraft Manufacturing" },
  { code: "541330", label: "541330 – Engineering Services" },
  { code: "541511", label: "541511 – Custom Computer Programming" },
  { code: "541512", label: "541512 – Computer Systems Design" },
  { code: "541513", label: "541513 – Computer Facilities Management" },
  { code: "541519", label: "541519 – Other Computer-Related Services" },
  { code: "541611", label: "541611 – Management Consulting" },
  { code: "541690", label: "541690 – Other Scientific & Technical Consulting" },
  { code: "541990", label: "541990 – All Other Professional Services" },
  { code: "561110", label: "561110 – Office Administrative Services" },
  { code: "561210", label: "561210 – Facilities Support Services" },
  { code: "611430", label: "611430 – Professional & Management Training" }
];

const FEATURES = [
  { icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", text: "Real-time SAM.gov opportunity search" },
  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "AI-powered bid/no-bid scoring" },
  { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", text: "FAR/DFARS compliance review" },
  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "Daily opportunity digest emails" }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
    naicsCodes: [],
    rememberMe: false
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleNaicsToggle(code) {
    setForm((f) => ({
      ...f,
      naicsCodes: f.naicsCodes.includes(code)
        ? f.naicsCodes.filter((c) => c !== code)
        : [...f.naicsCodes, code]
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (mode === "login") {
        res = await authApi.login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) {
          setError("Full name is required.");
          setLoading(false);
          return;
        }
        res = await authApi.register({
          email: form.email,
          password: form.password,
          name: form.name,
          company: form.company,
          naicsCodes: form.naicsCodes
        });
      }
      saveAuth(res.data, form.rememberMe);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Left panel (branding) — hidden on small screens */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 px-12 py-10 relative overflow-hidden" style={{ background: "#14243a" }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-16 translate-y-16" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-16 relative">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "#9a7724" }}>
            <span className="text-white font-bold text-lg leading-none">B</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm">BlackCrest Sourcing Group</div>
            <div className="text-xs tracking-widest uppercase" style={{ color: "#9a7724" }}>GovCon AI Scanner</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative flex-1">
          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Win more federal<br />contracts with AI.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "#8a9bb0" }}>
            Find, evaluate, and prioritize federal contracting opportunities in minutes — not hours.
            Built for GovCon professionals who demand results.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <svg className="w-4 h-4" style={{ color: "#9a7724" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <span className="text-sm" style={{ color: "#c8d5e6" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="relative mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3 mb-2">
            {["A", "B", "C"].map((l) => (
              <div key={l} className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold" style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.1)" }}>
                {l}
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#8a9bb0" }}>
            Trusted by 500+ GovCon professionals &bull; SAM.gov certified integration
          </p>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex flex-col" style={{ background: "#f7fafe" }}>
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(20,36,58,0.10)", background: "#ffffff" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#14243a" }}>
              <span className="text-white font-bold text-sm leading-none">B</span>
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#14243a" }}>BlackCrest Sourcing Group</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#14243a" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-sm font-bold" style={{ color: "#14243a" }}>GovCon AI Scanner</div>
          </div>
        </header>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold" style={{ color: "#14243a" }}>
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm mt-1" style={{ color: "#5d6b7c" }}>
                {mode === "login"
                  ? "Sign in to access your GovCon dashboard"
                  : "Start your 14-day free trial — no credit card required"}
              </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid rgba(20,36,58,0.12)", boxShadow: "0 10px 28px rgba(20,36,58,0.08)" }}>
              {/* Tab switcher */}
              <div className="flex rounded-lg p-1 mb-6" style={{ background: "#edf3fb" }}>
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
                  style={mode === "login" ? { background: "#ffffff", color: "#14243a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "#5d6b7c" }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
                  style={mode === "register" ? { background: "#ffffff", color: "#14243a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "#5d6b7c" }}
                >
                  Register
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#a63c3c" }}>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Register-only fields */}
                {mode === "register" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                        Full Name
                      </label>
                      <input
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                        style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
                        type="text"
                        name="name"
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                        Company <span className="font-normal" style={{ color: "#5d6b7c" }}>(optional)</span>
                      </label>
                      <input
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                        style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
                        type="text"
                        name="company"
                        placeholder="Acme Federal Solutions LLC"
                        value={form.company}
                        onChange={handleChange}
                        autoComplete="organization"
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                    Email Address
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                    style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                    Password
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                    style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
                    type="password"
                    name="password"
                    placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                  />
                </div>

                {/* NAICS codes (register only) */}
                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                      NAICS Codes{" "}
                      <span className="font-normal" style={{ color: "#5d6b7c" }}>(optional — improves opportunity matching)</span>
                    </label>
                    <p className="text-xs mb-2" style={{ color: "#5d6b7c" }}>
                      Select the industry codes that best describe your business. These help us surface the most relevant federal opportunities for you.
                    </p>
                    <div
                      className="max-h-44 overflow-y-auto rounded-xl p-2 space-y-1"
                      style={{ border: "1px solid #c8d5e6", background: "#fbfdff" }}
                    >
                      {NAICS_OPTIONS.map(({ code, label }) => (
                        <label
                          key={code}
                          className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 text-sm transition-colors"
                          style={form.naicsCodes.includes(code) ? { background: "rgba(20,36,58,0.06)", color: "#14243a" } : { color: "#14243a" }}
                        >
                          <input
                            type="checkbox"
                            checked={form.naicsCodes.includes(code)}
                            onChange={() => handleNaicsToggle(code)}
                            style={{ accentColor: "#14243a" }}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    {form.naicsCodes.length > 0 && (
                      <p className="text-xs mt-1" style={{ color: "#9a7724" }}>
                        {form.naicsCodes.length} code{form.naicsCodes.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                )}

                {/* Remember me / Forgot */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={form.rememberMe}
                      onChange={handleChange}
                      style={{ accentColor: "#14243a" }}
                    />
                    <span className="text-sm" style={{ color: "#5d6b7c" }}>Remember me</span>
                  </label>
                  {mode === "login" && (
                    <button type="button" className="text-sm font-medium" style={{ color: "#9a7724", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                      Forgot password?
                    </button>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2"
                  style={{ background: loading ? "#4a6080" : "#14243a", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
                >
                  {loading
                    ? (mode === "login" ? "Signing in…" : "Creating account…")
                    : (mode === "login" ? "Sign In" : "Create Account")}
                </button>
              </form>

              {/* Pricing note (register) */}
              {mode === "register" && (
                <p className="text-center text-xs mt-4" style={{ color: "#8a9bb0" }}>
                  After trial: $79/month &bull; Cancel anytime &bull; No credit card required to start
                </p>
              )}
            </div>

            <p className="text-center text-xs mt-6" style={{ color: "#5d6b7c" }}>
              Designed for Non-Classified Use Only &bull; GovCon AI Scanner v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
