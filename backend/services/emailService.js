import nodemailer from "nodemailer";
import Opportunity from "../models/Opportunity.js";
import EmailPreference from "../models/EmailPreference.js";

// Inline SVG logo used in email templates (safe for all email clients)
const EMAIL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="176" height="48" role="img" aria-label="BlackCrest AI Opportunity Intelligence">
  <title>BlackCrest AI Opportunity Intelligence</title>
  <g transform="translate(4,4)">
    <circle cx="23" cy="23" r="19" fill="#14243a" stroke="#1e3553" stroke-width="2"/>
    <text x="23" y="29" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="#ffffff">G</text>
    <line x1="37" y1="37" x2="50" y2="50" stroke="#14243a" stroke-width="5" stroke-linecap="round"/>
    <circle cx="10" cy="10" r="2.5" fill="#c79d3b"/>
    <circle cx="36" cy="10" r="2.5" fill="#c79d3b"/>
    <circle cx="10" cy="36" r="2.5" fill="#c79d3b"/>
    <circle cx="36" cy="36" r="2.5" fill="#c79d3b"/>
  </g>
  <text x="66" y="22" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="#14243a" letter-spacing="0.5">BlackCrest AI</text>
  <text x="66" y="40" font-family="Arial,sans-serif" font-size="10" fill="#9a7724" letter-spacing="1">PLATFORM</text>
</svg>`;

function createTransport() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_SECURE,
    OUTBOUND_EMAIL_PROVIDER,
    OUTBOUND_EMAIL_USER,
    OUTBOUND_EMAIL_PASSWORD,
    SENDGRID_API_KEY
  } = process.env;

  // Generic SMTP support (Render/hosted providers often use these env names).
  // When configured, prefer this transport before provider-specific presets.
  if (SMTP_HOST && (SMTP_USER || OUTBOUND_EMAIL_USER) && (SMTP_PASSWORD || OUTBOUND_EMAIL_PASSWORD)) {
    const parsedPort = Number.parseInt(SMTP_PORT || "", 10);
    const port = Number.isFinite(parsedPort) ? parsedPort : 587;
    const secure = typeof SMTP_SECURE === "string"
      ? ["1", "true", "yes"].includes(SMTP_SECURE.toLowerCase())
      : port === 465;

    return nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure,
      auth: {
        user: SMTP_USER || OUTBOUND_EMAIL_USER,
        pass: SMTP_PASSWORD || OUTBOUND_EMAIL_PASSWORD
      }
    });
  }

  if (SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: SENDGRID_API_KEY
      }
    });
  }

  if (OUTBOUND_EMAIL_PROVIDER === "smtp" && OUTBOUND_EMAIL_USER && OUTBOUND_EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: SMTP_HOST || "smtp.sendgrid.net",
      port: Number.parseInt(SMTP_PORT || "587", 10),
      secure: false,
      auth: {
        user: OUTBOUND_EMAIL_USER,
        pass: OUTBOUND_EMAIL_PASSWORD
      }
    });
  }

  throw new Error(
    "Email not configured. Set SMTP_HOST + SMTP_USER + SMTP_PASSWORD or OUTBOUND_EMAIL_PROVIDER/OUTBOUND_EMAIL_USER/OUTBOUND_EMAIL_PASSWORD, or SENDGRID_API_KEY."
  );
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "N/A";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatOpportunitiesHtml(opportunities) {
  if (!opportunities.length) {
    return "<p>No new opportunities matching your profile today.</p>";
  }

  return opportunities
    .map(
      (opp) => `
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 8px;color:#1e293b;">
          <a href="${escapeHtml(opp.uiLink || "#")}" style="color:#2563eb;text-decoration:none;">
            ${escapeHtml(opp.title || "Untitled Opportunity")}
          </a>
        </h3>
        <p style="margin:4px 0;color:#64748b;font-size:14px;">
          <strong>Agency:</strong> ${escapeHtml(opp.agency)} |
          <strong>NAICS:</strong> ${escapeHtml(opp.naicsCode)} |
          <strong>Set-Aside:</strong> ${escapeHtml(opp.setAside || "None")}
        </p>
        <p style="margin:4px 0;color:#64748b;font-size:14px;">
          <strong>Posted:</strong> ${escapeHtml(opp.postedDate)} |
          <strong>Response Due:</strong> ${escapeHtml(opp.responseDeadLine)}
        </p>
        ${
          opp.bidScore !== null
            ? `<p style="margin:8px 0 0;"><strong>Bid Score:</strong> ${escapeHtml(opp.bidScore)} / 100 — ${escapeHtml(opp.recommendation)}</p>`
            : ""
        }
      </div>`
    )
    .join("");
}

export async function sendDailyDigest(user) {
  if (!user || !user._id || !user.email) {
    throw new Error("sendDailyDigest: invalid user object (must have _id and email)");
  }

  const transport = createTransport();
  const fromAddress = process.env.OUTBOUND_EMAIL_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.OUTBOUND_EMAIL_USER || "noreply@blackcrestai.com";

  // Fetch email preferences for this user
  const prefs = await EmailPreference.findOne({ user: user._id });
  const minScore = prefs?.minBidScore ?? 0;

  // Build the combined NAICS filter: merge preference-level filter with
  // the user's own registered NAICS codes so we surface relevant opps
  // even when no opportunities have been explicitly saved.
  const naicsFromPrefs = Array.isArray(prefs?.naicsFilter) ? prefs.naicsFilter : [];
  const naicsFromProfile = Array.isArray(user.naicsCodes) ? user.naicsCodes : [];
  const combinedNaics = [...new Set([...naicsFromPrefs, ...naicsFromProfile])];

  // Match opportunities saved by the user OR matching their NAICS codes
  const orClauses = [{ savedBy: user._id }];
  if (combinedNaics.length) {
    orClauses.push({ naicsCode: { $in: combinedNaics } });
  }

  const query = { $or: orClauses };
  if (minScore > 0) query.bidScore = { $gte: minScore };

  const opportunities = await Opportunity.find(query).sort({ postedDate: -1 }).limit(20);

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="margin-bottom:24px;">${EMAIL_LOGO_SVG}</div>
        <h2 style="color:#64748b;font-weight:normal;margin:0 0 24px;">Daily Opportunity Intelligence Digest</h2>
        <p>Hello ${escapeHtml(user.name || user.email)},</p>
        <p>Here are your latest opportunities across federal and commercial markets:</p>
        ${formatOpportunitiesHtml(opportunities)}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:12px;">
          Designed for Non-Classified Use Only. BlackCrest AI provides preliminary analysis and does not
          replace professional contract review.
        </p>
      </div>
    </body>
    </html>`;

  const info = await transport.sendMail({
    from: `"BlackCrest AI Opportunity Intelligence" <${fromAddress}>`,
    to: user.email,
    subject: `BlackCrest AI Daily Digest — ${new Date().toLocaleDateString()}`,
    html
  });

  // Update lastSentAt
  await EmailPreference.findOneAndUpdate(
    { user: user._id },
    { lastSentAt: new Date() },
    { upsert: true }
  );

  return { messageId: info.messageId };
}

export async function sendMfaOtpEmail(user, otp) {
  const transport = createTransport();
  const fromAddress = process.env.OUTBOUND_EMAIL_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.OUTBOUND_EMAIL_USER || "noreply@blackcrestai.com";
  const expiryMinutes = parseInt(process.env.MFA_OTP_EXPIRY_MINUTES || "5", 10);

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="margin-bottom:24px;">${EMAIL_LOGO_SVG}</div>
        <h2 style="color:#1e293b;margin:0 0 8px;">Your Verification Code</h2>
        <p>Hello ${escapeHtml(user.name || user.email)},</p>
        <p>Use the code below to complete your sign-in. This code expires in <strong>${expiryMinutes} minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <div style="display:inline-block;padding:16px 40px;background:#f1f5f9;border:2px solid #14243a;border-radius:12px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#14243a;font-family:monospace;">
            ${escapeHtml(otp)}
          </div>
        </div>
        <p style="color:#64748b;font-size:13px;">
          Never share this code with anyone. BlackCrest AI will never ask for your code.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:12px;">
          If you did not request this code, please contact support immediately.
          <br/>Designed for Non-Classified Use Only.
        </p>
      </div>
    </body>
    </html>`;

  await transport.sendMail({
    from: `"BlackCrest AI Opportunity Intelligence" <${fromAddress}>`,
    to: user.email,
    subject: "Your BlackCrest AI Opportunity Intelligence Verification Code",
    html
  });
}

export async function sendPasswordResetEmail(user, resetToken, baseUrl) {
  const appUrl = (baseUrl || process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "");
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  // In non-production environments, fall back to console output when email transport
  // is not configured so developers can still exercise the full reset flow.
  let transport;
  try {
    transport = createTransport();
  } catch (configErr) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[EmailService] Password reset email not sent — email transport is not configured.\n" +
        `[EmailService] Reset URL for ${user.email}: ${resetUrl}`
      );
      return; // treat as success in non-production to unblock the flow
    }
    throw configErr; // re-throw in production so the caller can handle it
  }

  const fromAddress = process.env.OUTBOUND_EMAIL_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.OUTBOUND_EMAIL_USER || "noreply@blackcrestai.com";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="margin-bottom:24px;">${EMAIL_LOGO_SVG}</div>
        <h2 style="color:#1e293b;margin:0 0 8px;">Password Reset Request</h2>
        <p>Hello ${escapeHtml(user.name || user.email)},</p>
        <p>We received a request to reset your BlackCrest AI Opportunity Intelligence password. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;padding:14px 32px;background:#14243a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;">
            Reset My Password
          </a>
        </div>
        <p style="color:#64748b;font-size:13px;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#2563eb;word-break:break-all;">${resetUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:12px;">
          If you did not request a password reset, you can safely ignore this email — your password will not change.
          <br/>Designed for Non-Classified Use Only. BlackCrest AI provides preliminary analysis and does not replace professional contract review.
        </p>
      </div>
    </body>
    </html>`;

  await transport.sendMail({
    from: `"BlackCrest AI Opportunity Intelligence" <${fromAddress}>`,
    to: user.email,
    subject: "Reset Your BlackCrest AI Opportunity Intelligence Password",
    html
  });
}
