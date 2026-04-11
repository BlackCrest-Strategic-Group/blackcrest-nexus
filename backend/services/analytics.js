/**
 * Analytics Service
 *
 * Provides methods to compute key business metrics from the database.
 * All heavy queries are isolated here so routes stay thin.
 */

import mongoose from "mongoose";
import User from "../models/User.js";
import Opportunity from "../models/Opportunity.js";
import EmailPreference from "../models/EmailPreference.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startOf(unit, offsetDays = 0) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - offsetDays);
  if (unit === "month") d.setUTCDate(1);
  if (unit === "week") d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d;
}

function lastNDays(days) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    return d.toISOString().split("T")[0];
  });
}

// ---------------------------------------------------------------------------
// Dashboard Metrics
// ---------------------------------------------------------------------------

export async function getDashboardMetrics() {
  const now = new Date();
  const startThisMonth = startOf("month");
  const startLastMonth = new Date(startThisMonth);
  startLastMonth.setUTCMonth(startLastMonth.getUTCMonth() - 1);
  const endLastMonth = new Date(startThisMonth);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    newUsersLastMonth,
    adminUsers,
    totalOpportunities,
    savedOpportunities,
    emailPrefs,
    mau
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: startThisMonth } }),
    User.countDocuments({ createdAt: { $gte: startLastMonth, $lt: endLastMonth } }),
    User.countDocuments({ role: "admin" }),
    Opportunity.countDocuments(),
    Opportunity.countDocuments({ "savedBy.0": { $exists: true } }),
    EmailPreference.countDocuments({ enabled: true }),
    User.countDocuments({ isActive: true, updatedAt: { $gte: thirtyDaysAgo } })
  ]);

  const growthRate =
    newUsersLastMonth > 0
      ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1)
      : newUsersThisMonth > 0
      ? "100.0"
      : "0.0";

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      newThisMonth: newUsersThisMonth,
      newLastMonth: newUsersLastMonth,
      growthRate: parseFloat(growthRate),
      mau
    },
    opportunities: { total: totalOpportunities, saved: savedOpportunities },
    email: { subscribed: emailPrefs },
    generatedAt: now.toISOString()
  };
}

// ---------------------------------------------------------------------------
// Usage Trends
// ---------------------------------------------------------------------------

export async function getUsageTrends(days = 30) {
  const labels = lastNDays(days);
  const since = new Date(labels[0]);

  const signupAgg = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
  ]);

  const searchAgg = await Opportunity.aggregate([
    { $match: { cachedAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$cachedAt" } }, count: { $sum: 1 } } }
  ]);

  const signupMap = Object.fromEntries(signupAgg.map((r) => [r._id, r.count]));
  const searchMap = Object.fromEntries(searchAgg.map((r) => [r._id, r.count]));

  return {
    labels,
    registrations: labels.map((d) => signupMap[d] || 0),
    searches: labels.map((d) => searchMap[d] || 0)
  };
}

// ---------------------------------------------------------------------------
// Revenue Analytics
// ---------------------------------------------------------------------------

export async function getRevenueAnalytics() {
  const [subscribers, churned] = await Promise.all([
    User.countDocuments({ isActive: true, role: "user" }),
    User.countDocuments({ isActive: false, role: "user" })
  ]);

  const pricePerMonth = 79;
  const mrr = subscribers * pricePerMonth;
  const arr = mrr * 12;

  return { mrr, arr, subscribers, churned, pricePerMonth };
}

// ---------------------------------------------------------------------------
// Feature Usage
// ---------------------------------------------------------------------------

export async function getFeatureUsage() {
  const [naicsAgg, emailFreqAgg] = await Promise.all([
    User.aggregate([
      { $unwind: "$naicsCodes" },
      { $group: { _id: "$naicsCodes", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    EmailPreference.aggregate([{ $group: { _id: "$frequency", count: { $sum: 1 } } }])
  ]);

  return {
    topNaicsCodes: naicsAgg.map((r) => ({ code: r._id, users: r.count })),
    emailFrequency: Object.fromEntries(emailFreqAgg.map((r) => [r._id, r.count]))
  };
}

// ---------------------------------------------------------------------------
// Search Trends
// ---------------------------------------------------------------------------

export async function getSearchTrends() {
  const [topNaics, topAgencies] = await Promise.all([
    Opportunity.aggregate([
      { $match: { naicsCode: { $ne: null } } },
      { $group: { _id: "$naicsCode", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Opportunity.aggregate([
      { $match: { agency: { $ne: null } } },
      { $group: { _id: "$agency", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    topNaicsCodes: topNaics.map((r) => ({ code: r._id, count: r.count })),
    topAgencies: topAgencies.map((r) => ({ agency: r._id, count: r.count }))
  };
}

// ---------------------------------------------------------------------------
// System Health
// ---------------------------------------------------------------------------


function hasConfiguredValue(...values) {
  return values.some((v) => typeof v === "string" && v.trim().length > 0);
}

export async function getSystemHealth() {
  let mongoStatus = "unknown";
  let mongoLatencyMs = null;

  try {
    const dbStart = Date.now();
    await mongoose.connection.db.admin().ping();
    mongoLatencyMs = Date.now() - dbStart;
    mongoStatus = "healthy";
  } catch {
    mongoStatus = "unreachable";
  }

  const uptimeSeconds = process.uptime();
  const mem = process.memoryUsage();

  return {
    status: mongoStatus === "healthy" ? "healthy" : "degraded",
    uptime: { seconds: Math.round(uptimeSeconds), human: formatUptime(uptimeSeconds) },
    memory: {
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(1),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(1),
      rssMB: (mem.rss / 1024 / 1024).toFixed(1)
    },
    integrations: {
      mongodb: { status: mongoStatus, latencyMs: mongoLatencyMs },
      samApi: {
        configured: hasConfiguredValue(
          process.env.SAM_API_KEY,
          process.env.SAM_GOV_API_KEY,
          process.env.SAMGOV_API_KEY
        )
      },
      email: {
        configured: hasConfiguredValue(process.env.SENDGRID_API_KEY) ||
          (hasConfiguredValue(process.env.GMAIL_USER) && hasConfiguredValue(process.env.GMAIL_PASSWORD)),
        senderConfigured: hasConfiguredValue(process.env.EMAIL_FROM)
      },
      stripe: { configured: hasConfiguredValue(process.env.STRIPE_PAYMENT_LINK) }
    },
    nodeVersion: process.version,
    env: process.env.NODE_ENV || "development"
  };
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

export async function getDailyRegistrations(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);

  return result.map((r) => ({
    date: `${r._id.year}-${String(r._id.month).padStart(2, "0")}-${String(r._id.day).padStart(2, "0")}`,
    registrations: r.count
  }));
}

export async function getPopularNaicsCodes(limit = 20) {
  const result = await User.aggregate([
    { $unwind: "$naicsCodes" },
    { $group: { _id: "$naicsCodes", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);

  return result.map((r) => ({ naicsCode: r._id, userCount: r.count }));
}

export async function getSavedOpportunityTrends(limit = 20) {
  const result = await Opportunity.aggregate([
    { $match: { "savedBy.0": { $exists: true } } },
    { $group: { _id: "$naicsCode", saves: { $sum: { $size: "$savedBy" } }, opportunities: { $sum: 1 } } },
    { $sort: { saves: -1 } },
    { $limit: limit }
  ]);

  return result.map((r) => ({ naicsCode: r._id, totalSaves: r.saves, uniqueOpportunities: r.opportunities }));
}

export async function getUserList({ page = 1, limit = 20, search = "", role = null } = {}) {
  const query = {};
  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [{ email: regex }, { name: regex }, { company: regex }];
  }
  if (role) query.role = role;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).select("-password -refreshToken").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query)
  ]);

  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getUserStats(userId) {
  const [user, emailPref, savedCount] = await Promise.all([
    User.findById(userId).select("-password -refreshToken"),
    EmailPreference.findOne({ user: userId }),
    Opportunity.countDocuments({ savedBy: userId })
  ]);

  if (!user) return null;

  return {
    user: user.toObject(),
    emailPreferences: emailPref,
    stats: { savedOpportunities: savedCount }
  };
}