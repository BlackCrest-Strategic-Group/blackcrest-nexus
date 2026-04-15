import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi, mfaApi } from "../utils/api.js";
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

// TOTP setup wizard — shown when a user hasn't configured an authenticator app yet
function TotpSetupStep({ mfaSetupToken, onSuccess, onBack }) {
  const [step, setStep] = useState("loading"); // loading | scan | verify | backup-codes
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);
  const [addTab, setAddTab] = useState(() => window.innerWidth < 600 ? "key" : "qr");
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    async function initSetup() {
      try {
        const res = await mfaApi.setupTotp(mfaSetupToken);
        setQrCode(res.data.qrCode);
        setManualKey(res.data.manualEntryKey);
        setStep("scan");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to generate QR code. Please go back and try again.");
        setStep("error");
      }
    }
    initSetup();
  }, [mfaSetupToken]);

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(totpCode.trim())) {
      setError("Please enter the 6-digit code shown in your authenticator app.");
      return;
    }
    setLoading(true);
    try {
      const res = await mfaApi.verifyTotpSetup(mfaSetupToken, totpCode.trim());
      setBackupCodes(res.data.backupCodes || []);
      setSessionData(res.data);
      setStep("backup-codes");
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "loading") {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderColor: "#14243a", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "#5d6b7c" }}>Generating your authenticator QR code…</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div>
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#a63c3c" }}>
          {error}
        </div>
        <button type="button" onClick={onBack} className="text-sm" style={{ color: "#5d6b7c", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          ← Back to Sign In
        </button>
      </div>
    );
  }

  if (step === "scan") {
    return (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-1" style={{ color: "#14243a" }}>Set Up Authenticator App</h2>
          <p className="text-sm" style={{ color: "#5d6b7c" }}>
            Add your account to <strong>Microsoft Authenticator</strong> (or any TOTP app like Google Authenticator or Authy).
          </p>
        </div>

        {/* Step 1: Install the app */}
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", color: "#1e40af" }}>
          <strong>Step 1:</strong> If you don't have it yet, install <strong>Microsoft Authenticator</strong> from the App Store or Google Play on your phone.
        </div>

        {/* Step 2: Tab selector */}
        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#5d6b7c" }}>Step 2: Add your account</p>
        <div className="flex rounded-lg p-1 mb-4" style={{ background: "#edf3fb" }}>
          <button
            type="button"
            onClick={() => setAddTab("key")}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
            style={addTab === "key"
              ? { background: "#ffffff", color: "#14243a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
              : { color: "#5d6b7c", background: "none", border: "none" }}
          >
            📱 On This Phone
          </button>
          <button
            type="button"
            onClick={() => setAddTab("qr")}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
            style={addTab === "qr"
              ? { background: "#ffffff", color: "#14243a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
              : { color: "#5d6b7c", background: "none", border: "none" }}
          >
            🖥 Scan QR Code
          </button>
        </div>

        {addTab === "key" && (
          <div>
            <p className="text-sm mb-3" style={{ color: "#5d6b7c" }}>
              Open Microsoft Authenticator → tap <strong>+</strong> → <strong>Other account</strong> → <strong>Enter code manually</strong>, then type in the key below.
            </p>
            <div className="rounded-xl p-4 mb-3" style={{ background: "#f8fafc", border: "1px solid #c8d5e6" }}>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "#5d6b7c" }}>Account Name</p>
              <p className="text-sm font-mono mb-3" style={{ color: "#14243a" }}>GovCon AI (Powered by Truth Serum)</p>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "#5d6b7c" }}>Setup Key</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono break-all flex-1" style={{ color: "#14243a", wordBreak: "break-all" }}>
                  {manualKey}
                </p>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(manualKey).catch(() => {}); setKeyCopied(true); setTimeout(() => setKeyCopied(false), 2000); }}
                  className="text-xs px-3 py-1.5 rounded-lg shrink-0"
                  style={{ background: keyCopied ? "#166534" : "#14243a", color: "#ffffff", border: "none", cursor: "pointer" }}
                >
                  {keyCopied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
            <p className="text-xs mb-4" style={{ color: "#5d6b7c" }}>
              Make sure <strong>Time-based</strong> is selected (not Counter-based) in the authenticator app.
            </p>
          </div>
        )}

        {addTab === "qr" && (
          <div>
            <p className="text-sm mb-3" style={{ color: "#5d6b7c" }}>
              Open Microsoft Authenticator on a <strong>different device</strong> → tap <strong>+</strong> → <strong>Scan QR code</strong> → point the camera at the code below.
            </p>
            <div className="flex justify-center mb-4">
              <div className="rounded-xl p-3" style={{ background: "#ffffff", border: "1px solid #c8d5e6", display: "inline-block" }}>
                <img src={qrCode} alt="Authenticator QR code" style={{ width: 180, height: 180, display: "block" }} />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => { setStep("verify"); setError(""); }}
          className="w-full py-3 rounded-xl font-bold text-sm text-white"
          style={{ background: "#14243a", border: "none", cursor: "pointer" }}
        >
          I've Added the Account →
        </button>
        <div className="mt-3 text-center">
          <button type="button" onClick={onBack} className="text-sm" style={{ color: "#5d6b7c", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold mb-1" style={{ color: "#14243a" }}>Verify Setup</h2>
          <p className="text-sm" style={{ color: "#5d6b7c" }}>
            Enter the 6-digit code from your authenticator app to confirm setup.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#a63c3c" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>Verification Code</label>
            <input
              className="w-full px-3.5 py-3 rounded-xl text-center text-2xl font-mono tracking-[0.4em]"
              style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
              type="tel"
              inputMode="numeric"
              placeholder="000000"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: loading ? "#4a6080" : "#14243a", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Verifying…" : "Confirm & Continue"}
          </button>
        </form>
        <div className="mt-3 text-center">
          <button type="button" onClick={() => { setStep("scan"); setError(""); }} className="text-sm" style={{ color: "#5d6b7c", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            ← Back to QR Code
          </button>
        </div>
      </div>
    );
  }

  if (step === "backup-codes") {
    return (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-1" style={{ color: "#14243a" }}>Save Your Backup Codes</h2>
          <p className="text-sm" style={{ color: "#5d6b7c" }}>
            Store these codes in a safe place. Each code can only be used once if you lose access to your authenticator app.
          </p>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: "#f8fafc", border: "1px solid #c8d5e6" }}>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code) => (
              <div key={code} className="text-center font-mono text-sm py-1 px-2 rounded" style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#14243a" }}>
                {code}
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={savedCodes} onChange={(e) => setSavedCodes(e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm" style={{ color: "#14243a" }}>I have saved my backup codes in a secure location</span>
        </label>

        <button
          type="button"
          disabled={!savedCodes}
          onClick={() => onSuccess(sessionData)}
          className="w-full py-3 rounded-xl font-bold text-sm text-white"
          style={{ background: savedCodes ? "#14243a" : "#94a3b8", border: "none", cursor: savedCodes ? "pointer" : "not-allowed" }}
        >
          Access Dashboard →
        </button>
      </div>
    );
  }

  return null;
}

// MFA verification step — shown when TOTP is already configured
function MfaVerifyStep({ mfaState, onSuccess, onBack }) {
  const [otp, setOtp] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isTotp = mfaState.mfaMethod === "totp";

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (!useBackup && !/^\d{6}$/.test(otp)) {
      setError("Verification code must be exactly 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const method = useBackup ? "backup" : (isTotp ? "totp" : "email");
      const res = await authApi.verifyMfaLogin({
        mfaToken: mfaState.mfaToken,
        method,
        otp: otp.trim()
      });
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ color: "#14243a" }}>Two-Factor Verification</h2>
        <p className="text-sm" style={{ color: "#5d6b7c" }}>
          {useBackup
            ? "Enter one of your backup codes to sign in."
            : isTotp
              ? "Enter the 6-digit code from your authenticator app."
              : "Enter the 6-digit code sent to your email."}
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#a63c3c" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
            {useBackup ? "Backup Code" : "Verification Code"}
          </label>
          <input
            className="w-full px-3.5 py-3 rounded-xl text-center text-2xl font-mono tracking-[0.4em]"
            style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
            type={useBackup ? "text" : "tel"}
            inputMode={useBackup ? undefined : "numeric"}
            placeholder={useBackup ? "XXXXXXXXXX" : "000000"}
            value={otp}
            onChange={(e) => setOtp(useBackup ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={useBackup ? 10 : 6}
            autoComplete="one-time-code"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm text-white"
          style={{ background: loading ? "#4a6080" : "#14243a", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Verifying…" : "Verify & Sign In"}
        </button>
      </form>

      <div className="mt-4 space-y-2 text-center">
        <button
          type="button"
          onClick={() => { setUseBackup((b) => !b); setOtp(""); setError(""); }}
          className="text-sm"
          style={{ color: "#9a7724", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          {useBackup ? "← Use authenticator code instead" : "Using a backup code?"}
        </button>
        <br />
        <button
          type="button"
          onClick={onBack}
          className="text-sm"
          style={{ color: "#5d6b7c", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Support ?mode=register&plan=pro links from the landing page
  const [mode, setMode] = useState(() => searchParams.get("mode") === "register" ? "register" : "login");
  const [selectedPlan] = useState(() => searchParams.get("plan") || "free");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
    naicsCodes: [],
    rememberMe: false
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaState, setMfaState] = useState(null); // { mfaToken, mfaMethod } when TOTP challenge required
  const [totpSetupToken, setTotpSetupToken] = useState(() => searchParams.get("mfaSetupToken") || null); // when TOTP setup required

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
    setSuccessMsg("");
    setLoading(true);
    try {
      if (mode === "forgotPassword") {
        await authApi.forgotPassword(form.email);
        setSuccessMsg("If that email is registered, a reset link has been sent. Please check your inbox.");
        setLoading(false);
        return;
      }

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
          naicsCodes: form.naicsCodes,
          plan: selectedPlan
        });
      }

      // TOTP setup required (first-time or new account)
      if (res.data.requiresMfaSetup) {
        setTotpSetupToken(res.data.mfaSetupToken);
        return;
      }

      // TOTP challenge required (already set up)
      if (res.data.requiresMfa) {
        setMfaState({ mfaToken: res.data.mfaToken, mfaMethod: res.data.mfaMethod });
        return;
      }

      const persisted = saveAuth(res.data, form.rememberMe);
      if (!persisted) {
        setError("Signed in, but your browser blocked secure storage. Please disable private mode or strict privacy settings and try again.");
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleMfaSuccess(data) {
    const persisted = saveAuth(data, form.rememberMe);
    if (!persisted) {
      setError("Signed in, but your browser blocked secure storage. Please disable private mode or strict privacy settings and try again.");
      return;
    }
    navigate("/dashboard", { replace: true });
  }

  function handleMfaBack() {
    setMfaState(null);
    setTotpSetupToken(null);
    setError("");
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
          <img src="/logos/blackcrest-logo.svg" alt="BlackCrest Strategic Group – GovCon AI (Powered by Truth Serum)" style={{ height: 48, width: "auto" }} />
        </div>

        {/* Hero text */}
        <div className="relative flex-1">
          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Win more commercial and federal<br />contracts with AI.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "#8a9bb0" }}>
            Find, evaluate, and prioritize commercial and federal contracting opportunities in minutes — not hours.
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
          <p className="text-sm text-gray-400">
            Built for GovCon professionals &bull; Powered by real-time SAM.gov data
          </p>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex flex-col" style={{ background: "#f7fafe" }}>
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(20,36,58,0.10)", background: "#ffffff" }}>
          <img src="/logos/blackcrest-logo.svg" alt="BlackCrest Strategic Group" style={{ height: 36, width: "auto" }} />
          <img src="/logos/govcon-logo.svg" alt="GovCon AI (Powered by Truth Serum)" style={{ height: 36, width: "auto" }} />
        </header>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* TOTP setup wizard — first-time setup */}
            {totpSetupToken ? (
              <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid rgba(20,36,58,0.12)", boxShadow: "0 10px 28px rgba(20,36,58,0.08)" }}>
                <TotpSetupStep
                  mfaSetupToken={totpSetupToken}
                  onSuccess={handleMfaSuccess}
                  onBack={handleMfaBack}
                />
              </div>
            ) : mfaState ? (
              <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid rgba(20,36,58,0.12)", boxShadow: "0 10px 28px rgba(20,36,58,0.08)" }}>
                <MfaVerifyStep
                  mfaState={mfaState}
                  onSuccess={handleMfaSuccess}
                  onBack={handleMfaBack}
                />
              </div>
            ) : (
            <>
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold" style={{ color: "#14243a" }}>
                {mode === "login" && "Welcome back"}
                {mode === "register" && "Create your account"}
                {mode === "forgotPassword" && "Forgot Password"}
              </h1>
              <p className="text-sm mt-1" style={{ color: "#5d6b7c" }}>
                {mode === "login" && "Sign in to access your GovCon dashboard"}
                {mode === "register" && "Start your 30-day free trial — no credit card required"}
                {mode === "forgotPassword" && "Enter your email and we'll send you a reset link"}
              </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid rgba(20,36,58,0.12)", boxShadow: "0 10px 28px rgba(20,36,58,0.08)" }}>
              {/* Tab switcher — hidden on forgot password mode */}
              {mode !== "forgotPassword" && (
                <div className="flex rounded-lg p-1 mb-6" style={{ background: "#edf3fb" }}>
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                    className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
                    style={mode === "login" ? { background: "#ffffff", color: "#14243a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "#5d6b7c" }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}
                    className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
                    style={mode === "register" ? { background: "#ffffff", color: "#14243a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "#5d6b7c" }}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#a63c3c" }}>
                  {error}
                </div>
              )}

              {/* Success message */}
              {successMsg && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}>
                  {successMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Forgot password mode: email only */}
                {mode === "forgotPassword" && (
                  <>
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
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2"
                      style={{ background: loading ? "#4a6080" : "#14243a", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
                    >
                      {loading ? "Sending…" : "Send Reset Link"}
                    </button>
                    <p className="text-center text-sm">
                      <button
                        type="button"
                        onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                        style={{ color: "#9a7724", background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 500 }}
                      >
                        ← Back to Sign In
                      </button>
                    </p>
                  </>
                )}

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

                {/* Email (login/register only) */}
                {mode !== "forgotPassword" && (
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
                )}

                {/* Password (login/register only) */}
                {mode !== "forgotPassword" && (
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
                )}

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

                {/* Remember me / Forgot (login only) */}
                {mode === "login" && (
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
                    <button
                      type="button"
                      className="text-sm font-medium"
                      style={{ color: "#9a7724", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                      onClick={() => { setMode("forgotPassword"); setError(""); setSuccessMsg(""); }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Remember me (register only) */}
                {mode === "register" && (
                  <div className="flex items-center pt-1">
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
                  </div>
                )}

                {/* Submit (login/register only) */}
                {mode !== "forgotPassword" && (
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
                )}
              </form>

              {/* Pricing note (register) */}
              {mode === "register" && (
                <p className="text-center text-xs mt-4" style={{ color: "#8a9bb0" }}>
                  {selectedPlan === "pro" && "After 30-day trial: $349/month"}
                  {selectedPlan === "enterprise" && "After 30-day trial: $595/month"}
                  {selectedPlan === "free" && "Free plan — upgrade anytime"}
                  {!["pro", "enterprise", "free"].includes(selectedPlan) && "30-day free trial"}
                  {" "}&bull; Cancel anytime &bull; No credit card required to start
                </p>
              )}
            </div>

            <p className="text-sm text-gray-400">
              Built for GovCon professionals &bull; Powered by real-time SAM.gov data
            </p>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
