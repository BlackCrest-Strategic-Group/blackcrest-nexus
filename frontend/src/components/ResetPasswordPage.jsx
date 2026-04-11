import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../utils/api.js";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token.trim(), password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. The token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7fafe", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="w-full max-w-md px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/logos/govcon-logo.svg" alt="GovCon AI (Powered by Truth Serum)" style={{ height: 40, width: "auto" }} />
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid rgba(20,36,58,0.12)", boxShadow: "0 10px 28px rgba(20,36,58,0.08)" }}>
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#ecfdf5" }}>
                <svg className="w-7 h-7" style={{ color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#14243a" }}>Password Reset!</h2>
              <p className="text-sm mb-6" style={{ color: "#5d6b7c" }}>
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "#14243a", border: "none", cursor: "pointer" }}
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#14243a" }}>Set New Password</h2>
              <p className="text-sm mb-6" style={{ color: "#5d6b7c" }}>
                Enter the reset token from your email and choose a new password.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#a63c3c" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Token field – pre-filled from URL but editable */}
                <div>
                  <label htmlFor="reset-token" className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                    Reset Token
                  </label>
                  <input
                    id="reset-token"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono"
                    style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
                    type="text"
                    placeholder="Paste your reset token here"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    autoComplete="off"
                    aria-describedby="reset-token-hint"
                  />
                  <p id="reset-token-hint" className="text-xs mt-1" style={{ color: "#5d6b7c" }}>
                    Copy the token from the reset email you received.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                    New Password
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                    style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "#14243a" }}>
                    Confirm New Password
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                    style={{ border: "1px solid #c8d5e6", background: "#fbfdff", color: "#14243a", outline: "none", boxSizing: "border-box" }}
                    type="password"
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2"
                  style={{ background: loading ? "#4a6080" : "#14243a", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
                >
                  {loading ? "Resetting…" : "Reset Password"}
                </button>
              </form>

              <p className="text-center text-sm mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  style={{ color: "#9a7724", background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 500 }}
                >
                  ← Back to Sign In
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#5d6b7c" }}>
          Designed for Non-Classified Use Only &bull; GovCon AI (Powered by Truth Serum) v2.0
        </p>
      </div>
    </div>
  );
}
