import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mfaApi } from "../utils/api.js";
import Header from "./Header.jsx";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded"
      style={{ background: copied ? "#166534" : "#14243a", color: "#ffffff", border: "none", cursor: "pointer" }}
    >
      {copied ? "✓ Copied" : "Copy All"}
    </button>
  );
}

function StatusBadge({ enabled }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={enabled
        ? { background: "#dcfce7", color: "#166534" }
        : { background: "#f1f5f9", color: "#5d6b7c" }}
    >
      {enabled ? "● Enabled" : "○ Disabled"}
    </span>
  );
}

export default function MFASettingsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [disabling, setDisabling] = useState(null); // "email" | "sms" | null
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState(null);
  const [savedNewCodes, setSavedNewCodes] = useState(false);

  async function loadStatus() {
    try {
      const res = await mfaApi.status();
      setStatus(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load MFA status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleDisable(method) {
    setError("");
    setSuccessMsg("");
    setDisabling(method);
    try {
      const res = await mfaApi.disable(method);
      setSuccessMsg(res.data.message);
      await loadStatus();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to disable MFA.");
    } finally {
      setDisabling(null);
    }
  }

  async function handleGenerateBackupCodes() {
    setError("");
    setSuccessMsg("");
    setGeneratingCodes(true);
    setNewBackupCodes(null);
    setSavedNewCodes(false);
    try {
      const res = await mfaApi.generateBackupCodes();
      setNewBackupCodes(res.data.backupCodes);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate backup codes.");
    } finally {
      setGeneratingCodes(false);
    }
  }

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid rgba(20,36,58,0.10)",
    borderRadius: "12px",
    padding: "20px"
  };

  return (
    <div className="min-h-screen" style={{ background: "#f7fafe" }}>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#14243a" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#14243a" }}>Security Settings</h1>
            <p className="text-sm" style={{ color: "#5d6b7c" }}>Manage Two-Factor Authentication (2FA)</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#a63c3c" }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}>
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8" style={{ color: "#5d6b7c" }}>Loading security settings…</div>
        ) : (
          <div className="space-y-4">

            {/* Overall MFA status */}
            <div style={cardStyle}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#14243a" }}>Two-Factor Authentication</p>
                  <p className="text-xs mt-0.5" style={{ color: "#5d6b7c" }}>
                    {status?.mfaEnabled
                      ? "Your account is protected with 2FA."
                      : "Add an extra layer of security to your account."}
                  </p>
                </div>
                <StatusBadge enabled={status?.mfaEnabled} />
              </div>
              {!status?.mfaEnabled && (
                <button
                  onClick={() => navigate("/mfa-setup")}
                  className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#14243a", border: "none", cursor: "pointer" }}
                >
                  Enable 2FA
                </button>
              )}
            </div>

            {/* Email MFA */}
            <div style={cardStyle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#edf3fb" }}>
                    <svg className="w-4 h-4" style={{ color: "#14243a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#14243a" }}>Email Verification</p>
                    <p className="text-xs" style={{ color: "#5d6b7c" }}>Receive codes via email</p>
                  </div>
                </div>
                <StatusBadge enabled={status?.mfaMethods?.includes("email")} />
              </div>
              <div className="mt-3 flex gap-2">
                {status?.mfaMethods?.includes("email") ? (
                  <button
                    onClick={() => handleDisable("email")}
                    disabled={disabling === "email"}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "#fdf2f2", color: "#a63c3c", border: "1px solid #f5c6c6", cursor: "pointer" }}
                  >
                    {disabling === "email" ? "Disabling…" : "Disable Email 2FA"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/mfa-setup")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#14243a", border: "none", cursor: "pointer" }}
                  >
                    Enable Email 2FA
                  </button>
                )}
              </div>
            </div>

            {/* SMS MFA */}
            <div style={cardStyle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#edf3fb" }}>
                    <svg className="w-4 h-4" style={{ color: "#14243a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#14243a" }}>SMS Verification</p>
                    <p className="text-xs" style={{ color: "#5d6b7c" }}>
                      {status?.smsPhoneLastFour
                        ? `Phone ending in ${status.smsPhoneLastFour}`
                        : "Receive codes via SMS text message"}
                    </p>
                  </div>
                </div>
                <StatusBadge enabled={status?.mfaMethods?.includes("sms")} />
              </div>
              <div className="mt-3 flex gap-2">
                {status?.mfaMethods?.includes("sms") ? (
                  <button
                    onClick={() => handleDisable("sms")}
                    disabled={disabling === "sms"}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "#fdf2f2", color: "#a63c3c", border: "1px solid #f5c6c6", cursor: "pointer" }}
                  >
                    {disabling === "sms" ? "Disabling…" : "Disable SMS 2FA"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/mfa-setup")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#14243a", border: "none", cursor: "pointer" }}
                  >
                    Enable SMS 2FA
                  </button>
                )}
              </div>
            </div>

            {/* Backup Codes */}
            {status?.mfaEnabled && (
              <div style={cardStyle}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#14243a" }}>Backup Codes</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5d6b7c" }}>
                      {status?.backupCodesRemaining} code{status?.backupCodesRemaining !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateBackupCodes}
                    disabled={generatingCodes}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "#edf3fb", color: "#14243a", border: "1px solid #c8d5e6", cursor: "pointer" }}
                  >
                    {generatingCodes ? "Generating…" : "Generate New Codes"}
                  </button>
                </div>

                {newBackupCodes && (
                  <div className="mt-4">
                    <div className="rounded-xl p-4" style={{ background: "#f1f5f9", border: "1px solid #c8d5e6" }}>
                      <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: "#fffbeb", border: "1px solid #fbbf24" }}>
                        <p className="text-xs font-semibold" style={{ color: "#92400e" }}>
                          ⚠️ Save these codes — they will only be shown once. Your old codes are now invalid.
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color: "#5d6b7c" }}>NEW BACKUP CODES</span>
                        <CopyButton text={newBackupCodes.join("\n")} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {newBackupCodes.map((code) => (
                          <code key={code} className="text-sm font-mono py-1 px-2 rounded text-center" style={{ background: "#ffffff", color: "#14243a", border: "1px solid #c8d5e6" }}>
                            {code}
                          </code>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 mt-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={savedNewCodes}
                          onChange={(e) => setSavedNewCodes(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-xs" style={{ color: "#5d6b7c" }}>I have saved these codes</span>
                      </label>
                      {savedNewCodes && (
                        <button
                          onClick={() => setNewBackupCodes(null)}
                          className="mt-2 text-xs"
                          style={{ color: "#14243a", background: "none", border: "none", cursor: "pointer" }}
                        >
                          ✓ Done
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Last verification */}
            {status?.lastMfaVerificationAt && (
              <p className="text-xs text-center" style={{ color: "#9aabb8" }}>
                Last 2FA verification: {new Date(status.lastMfaVerificationAt).toLocaleString()}
              </p>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
