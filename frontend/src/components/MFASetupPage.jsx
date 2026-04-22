import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mfaApi } from "../utils/api.js";
import { isValidPhone } from "../utils/mfa.js";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded ml-2"
      style={{ background: copied ? "#166534" : "#14243a", color: "#ffffff", border: "none", cursor: "pointer" }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function MFASetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("choose"); // choose | email-sent | sms-phone | sms-sent | backup-codes
  const [method, setMethod] = useState("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);
  const safeBackupCodes = Array.isArray(backupCodes) ? backupCodes : [];

  async function handleStartEmail() {
    setError("");
    setLoading(true);
    try {
      const res = await mfaApi.setupEmail();
      setSetupToken(res.data.setupToken);
      setMethod("email");
      setStep("email-sent");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send verification email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartSms(e) {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phoneNumber)) {
      setError("Please enter a valid phone number in E.164 format (e.g. +12125551234).");
      return;
    }
    setLoading(true);
    try {
      const res = await mfaApi.setupSms(phoneNumber);
      setSetupToken(res.data.setupToken);
      setMethod("sms");
      setStep("sms-sent");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send SMS verification.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Verification code must be exactly 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const res = await mfaApi.verifySetup({ setupToken, otp, method });
      setBackupCodes(res.data.backupCodes);
      setStep("backup-codes");
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    navigate("/mfa-settings");
  }

  const inputStyle = {
    border: "1px solid #c8d5e6",
    background: "#fbfdff",
    color: "#14243a",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f7fafe" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid rgba(20,36,58,0.12)", boxShadow: "0 10px 28px rgba(20,36,58,0.08)" }}>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#14243a" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "#14243a" }}>Enable Two-Factor Authentication</h1>
              <p className="text-xs" style={{ color: "#5d6b7c" }}>Add an extra layer of security</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#a63c3c" }}>
              {error}
            </div>
          )}

          {/* Step: Choose method */}
          {step === "choose" && (
            <div>
              <p className="text-sm mb-4" style={{ color: "#5d6b7c" }}>
                Choose how you would like to receive your verification codes:
              </p>
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleStartEmail}
                  disabled={loading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                  style={{ border: "2px solid #14243a", background: "#f8fafc", cursor: loading ? "not-allowed" : "pointer" }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#edf3fb" }}>
                    <svg className="w-5 h-5" style={{ color: "#14243a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#14243a" }}>Email (Recommended)</p>
                    <p className="text-xs" style={{ color: "#5d6b7c" }}>Receive codes via email at no extra cost</p>
                  </div>
                  {loading ? <span className="text-xs" style={{ color: "#5d6b7c" }}>Sending…</span> : null}
                </button>

                <button
                  onClick={() => setStep("sms-phone")}
                  disabled={loading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                  style={{ border: "2px solid #c8d5e6", background: "#f8fafc", cursor: "pointer" }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#edf3fb" }}>
                    <svg className="w-5 h-5" style={{ color: "#5d6b7c" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#14243a" }}>SMS Text Message</p>
                    <p className="text-xs" style={{ color: "#5d6b7c" }}>Receive codes via SMS (requires Twilio)</p>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-2 text-sm"
                style={{ color: "#5d6b7c", background: "none", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Step: SMS phone number entry */}
          {step === "sms-phone" && (
            <form onSubmit={handleStartSms} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                  Phone Number
                </label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyle}
                  type="tel"
                  placeholder="+12125551234"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs mt-1" style={{ color: "#9aabb8" }}>
                  Enter in E.164 format (e.g. +12125551234)
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: loading ? "#4a6080" : "#14243a", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Sending…" : "Send Code via SMS"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("choose"); setError(""); }}
                className="w-full py-2 text-sm"
                style={{ color: "#5d6b7c", background: "none", border: "none", cursor: "pointer" }}
              >
                ← Back
              </button>
            </form>
          )}

          {/* Step: Email sent – enter OTP */}
          {step === "email-sent" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm mb-2" style={{ color: "#5d6b7c" }}>
                A 6-digit verification code has been sent to your email. Enter it below:
              </p>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                  Verification Code
                </label>
                <input
                  className="w-full px-3.5 py-3 rounded-xl text-center text-2xl font-mono tracking-[0.4em]"
                  style={inputStyle}
                  type="tel"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: loading ? "#4a6080" : "#14243a", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Verifying…" : "Verify & Enable"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setStep("choose"); setOtp(""); setError(""); }}
                  className="text-sm"
                  style={{ color: "#5d6b7c", background: "none", border: "none", cursor: "pointer" }}
                >
                  ← Back
                </button>
              </div>
            </form>
          )}

          {/* Step: SMS sent – enter OTP */}
          {step === "sms-sent" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm mb-2" style={{ color: "#5d6b7c" }}>
                A 6-digit verification code has been sent to your phone. Enter it below:
              </p>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                  Verification Code
                </label>
                <input
                  className="w-full px-3.5 py-3 rounded-xl text-center text-2xl font-mono tracking-[0.4em]"
                  style={inputStyle}
                  type="tel"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: loading ? "#4a6080" : "#14243a", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Verifying…" : "Verify & Enable"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setStep("sms-phone"); setOtp(""); setError(""); }}
                  className="text-sm"
                  style={{ color: "#5d6b7c", background: "none", border: "none", cursor: "pointer" }}
                >
                  ← Back
                </button>
              </div>
            </form>
          )}

          {/* Step: Show backup codes */}
          {step === "backup-codes" && (
            <div>
              <div className="mb-4 px-4 py-3 rounded-lg" style={{ background: "#fffbeb", border: "1px solid #fbbf24" }}>
                <p className="text-sm font-semibold" style={{ color: "#92400e" }}>⚠️ Save these backup codes</p>
                <p className="text-xs mt-1" style={{ color: "#92400e" }}>
                  These codes will only be shown once. Store them somewhere safe. Each code can only be used once.
                </p>
              </div>

              <div className="rounded-xl p-4 mb-4" style={{ background: "#f1f5f9", border: "1px solid #c8d5e6" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: "#5d6b7c" }}>BACKUP CODES</span>
                  <CopyButton text={safeBackupCodes.join("\n")} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {safeBackupCodes.map((code) => (
                    <code key={code} className="text-sm font-mono py-1 px-2 rounded text-center" style={{ background: "#ffffff", color: "#14243a", border: "1px solid #c8d5e6" }}>
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedCodes}
                  onChange={(e) => setSavedCodes(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm" style={{ color: "#5d6b7c" }}>I have saved these backup codes in a safe place</span>
              </label>

              <button
                onClick={handleDone}
                disabled={!savedCodes}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: savedCodes ? "#14243a" : "#9aabb8", border: "none", cursor: savedCodes ? "pointer" : "not-allowed" }}
              >
                ✓ Done — Go to Security Settings
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
