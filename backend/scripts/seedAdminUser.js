import User from "../models/User.js";

export async function seedAdminUser() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.isActive = true;
      await existing.save();
      console.log("[Admin] Existing user promoted to admin:", email);
    } else {
      console.log("[Admin] Admin user already exists:", email);
    }
    return;
  }

  const user = new User({
    email,
    password,
    name: process.env.ADMIN_BOOTSTRAP_NAME || "Platform Admin",
    company: process.env.ADMIN_BOOTSTRAP_COMPANY || "GovCon AI Scanner",
    role: "admin",
    isActive: true,
    naicsCodes: []
  });

  await user.save();
  console.log("[Admin] Bootstrap admin created:", email);
}
