import User from "../models/User.js";

export async function enforceSeatLimits(req, res, next) {
  const tenant = req.user?.tenant;
  if (!tenant?._id) {
    return res.status(403).json({ message: "Tenant context required" });
  }

  const seats = Math.max(1, Number(tenant.seats || 1));
  const activeUsers = await User.countDocuments({ tenantId: tenant._id });
  if (activeUsers <= seats) return next();

  if (req.user?.isTenantAdmin) {
    return next();
  }

  return res.status(402).json({
    message: "Seat limit exceeded for tenant",
    seats,
    activeUsers
  });
}

export default enforceSeatLimits;
