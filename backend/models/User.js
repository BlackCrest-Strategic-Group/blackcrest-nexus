import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    name: {
      type: String,
      trim: true,
      default: ""
    },
    company: {
      type: String,
      trim: true,
      default: ""
    },
    naicsCodes: {
      type: [String],
      default: []
    },
    role: {
      type: String,
      enum: ["user", "admin", "capture", "procurement", "ops", "exec"],
      default: "user"
    },
    refreshToken: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    // MFA fields
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaMethods: {
      type: [String],
      enum: ["email", "sms", "totp"],
      default: []
    },
    // TOTP (Authenticator App) fields
    totpSecret: {
      type: String,
      default: null
    },
    totpPendingSecret: {
      type: String,
      default: null
    },
    totpVerified: {
      type: Boolean,
      default: false
    },
    mfaOtpHash: {
      type: String,
      default: null
    },
    mfaOtpExpiresAt: {
      type: Date,
      default: null
    },
    smsPhoneEnc: {
      type: String,
      default: null
    },
    mfaBackupCodes: {
      type: [String],
      default: []
    },
    lastMfaVerificationAt: {
      type: Date,
      default: null
    },
    // ── Subscription / Billing ────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free"
    },
    planStatus: {
      type: String,
      enum: ["trialing", "active", "canceled", "past_due", "unpaid"],
      default: "trialing"
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain password against hash
userSchema.methods.comparePassword = async function (plainText) {
  return bcrypt.compare(plainText, this.password);
};

// Return safe user object (no password, no refresh token, no MFA secrets)
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    company: this.company,
    naicsCodes: this.naicsCodes,
    role: this.role,
    isDemo: this.isDemo,
    mfaEnabled: this.mfaEnabled,
    mfaMethods: this.mfaMethods,
    plan: this.plan,
    planStatus: this.planStatus,
    trialEndsAt: this.trialEndsAt,
    createdAt: this.createdAt
  };
};

const User = mongoose.model("User", userSchema);

export default User;
