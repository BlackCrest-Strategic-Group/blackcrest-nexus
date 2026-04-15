import User from "../models/User.js";
import EmailPreference from "../models/EmailPreference.js";

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || "demo@blackcrestai.com";
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || "Demo1234!";
const DEMO_NAME = "Demo User";
const DEMO_COMPANY = "BlackCrest AI Demo";

/**
 * Seeds the demo user into the database if it does not already exist.
 * The demo user is clearly marked with isDemo: true and can be used to
 * explore the application without creating a real account.
 *
 * Credentials (override via environment variables):
 *   Email:    DEMO_USER_EMAIL    (default: demo@blackcrestai.com)
 *   Password: DEMO_USER_PASSWORD (default: Demo1234!)
 */
export async function seedDemoUser() {
  try {
    const existing = await User.findOne({ email: DEMO_EMAIL });
    if (existing) {
      console.log("[Demo] Demo user already exists:", DEMO_EMAIL);
      return;
    }

    const user = new User({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: DEMO_NAME,
      company: DEMO_COMPANY,
      naicsCodes: [],
      role: "user",
      isDemo: true
    });

    await user.save();

    // Create default email preferences for the demo user
    await EmailPreference.create({ user: user._id });

    console.log("[Demo] Demo user created successfully:", DEMO_EMAIL);
  } catch (error) {
    console.error("[Demo] Failed to seed demo user:", error);
  }
}
