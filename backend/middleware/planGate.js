/**
 * planGate — tier-based feature access control middleware.
 *
 * Usage (after authenticateToken):
 *   router.get("/erp", authenticateToken, planGate("pro"), handler)
 *   router.get("/users", authenticateToken, planGate("enterprise"), handler)
 *
 * A user passes if:
 *  - Their plan meets or exceeds the required tier, OR
 *  - They are still within their 30-day trial period (granted full access), OR
 *  - They are a demo user.
 */

import User from "../models/User.js";

const TIER_RANK = { free: 0, pro: 1, enterprise: 2 };

export function planGate(requiredPlan) {
  return async (req, res, next) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    let user;
    try {
      user = await User.findById(req.user.id).select(
        "plan planStatus trialEndsAt isDemo isActive"
      );
    } catch (err) {
      console.error("planGate DB error:", err.message);
      return res.status(500).json({ success: false, error: "Plan check failed." });
    }

    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, error: "Account not found or inactive." });
    }

    // Demo users always get full access
    if (user.isDemo) return next();

    // Users within their trial window get full access
    if (user.trialEndsAt && user.trialEndsAt > new Date()) return next();

    const required = TIER_RANK[requiredPlan] ?? 0;
    const current = TIER_RANK[user.plan] ?? 0;

    if (current < required) {
      return res.status(403).json({
        success: false,
        error: `This feature requires the ${requiredPlan} plan or higher.`,
        requiredPlan,
        currentPlan: user.plan,
        upgradeUrl: "/pricing"
      });
    }

    next();
  };
}

export default planGate;
