import cron from "node-cron";
import EmailPreference from "../models/EmailPreference.js";
import { sendDailyDigest } from "./emailService.js";

// Default: run at the top of every hour so each user receives their digest
// at the local hour they configured (0–23).
const CRON_SCHEDULE = process.env.DIGEST_CRON_SCHEDULE || "0 * * * *";

export function startDigestScheduler() {
  if (!cron.validate(CRON_SCHEDULE)) {
    console.error(
      `[DigestScheduler] Invalid cron expression: "${CRON_SCHEDULE}". Scheduler not started.`
import User from "../models/User.js";
import EmailPreference from "../models/EmailPreference.js";
import { sendDailyDigest } from "./emailService.js";

// Default: run at 07:00 every day in the configured timezone
const DEFAULT_SCHEDULE = "0 7 * * *";
const DEFAULT_TIMEZONE = "America/New_York";

/**
 * Send the daily digest to all eligible users.
 * A user is eligible when their EmailPreference has enabled=true and
 * frequency is "daily" (or not set to "never").
 */
export async function runDailyDigest() {
  console.log("[DigestScheduler] Starting daily digest run...");

  let successCount = 0;
  let failureCount = 0;

  try {
    // Find all enabled, non-"never" preferences
    const prefs = await EmailPreference.find({
      enabled: true,
      frequency: { $ne: "never" }
    }).lean();

    if (!prefs.length) {
      console.log("[DigestScheduler] No users with active digest preferences found.");
      return;
    }

    const userIds = prefs.map((p) => p.user);
    const users = await User.find({ _id: { $in: userIds }, isActive: true }).lean();

    console.log(`[DigestScheduler] Sending digest to ${users.length} user(s)...`);

    for (const user of users) {
      try {
        await sendDailyDigest(user);
        successCount++;
        console.log(`[DigestScheduler] ✓ Digest sent to ${user.email}`);
      } catch (err) {
        failureCount++;
        console.error(`[DigestScheduler] ✗ Failed to send digest to ${user.email}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error("[DigestScheduler] Fatal error during digest run:", err.message);
  }

  console.log(
    `[DigestScheduler] Digest run complete. Success: ${successCount}, Failures: ${failureCount}`
  );
}

/**
 * Initialise and start the cron-based daily digest scheduler.
 * Reads DIGEST_CRON_SCHEDULE and DIGEST_TIMEZONE from the environment,
 * falling back to sensible defaults.
 */
export function startDigestScheduler() {
  const schedule = process.env.DIGEST_CRON_SCHEDULE || DEFAULT_SCHEDULE;
  const timezone = process.env.DIGEST_TIMEZONE || DEFAULT_TIMEZONE;

  if (!cron.validate(schedule)) {
    console.error(
      `[DigestScheduler] Invalid DIGEST_CRON_SCHEDULE "${schedule}". Scheduler NOT started.`
    );
    return;
  }

  cron.schedule(CRON_SCHEDULE, async () => {
    const currentHour = new Date().getHours();
    console.log(`[DigestScheduler] Running digest check for hour ${currentHour}`);

    try {
      // Find all enabled email preferences whose delivery hour matches the current hour
      const prefs = await EmailPreference.find({
        enabled: true,
        frequency: { $in: ["daily", "weekly"] },
        deliveryTime: currentHour
      }).populate("user");

      console.log(`[DigestScheduler] ${prefs.length} user(s) scheduled for hour ${currentHour}.`);

      const now = new Date();

      for (const pref of prefs) {
        const user = pref.user;
        if (!user || !user.isActive) continue;

        // For weekly frequency, skip if a digest was sent within the last 6 days
        if (pref.frequency === "weekly" && pref.lastSentAt) {
          const daysSinceLastSent = (now - new Date(pref.lastSentAt)) / (1000 * 60 * 60 * 24);
          if (daysSinceLastSent < 6) continue;
        }

        try {
          await sendDailyDigest(user);
          console.log(`[DigestScheduler] Digest sent to ${user.email}`);
        } catch (err) {
          console.error(
            `[DigestScheduler] Failed to send digest to ${user.email}:`,
            err.message
          );
        }
      }
    } catch (err) {
      console.error("[DigestScheduler] Scheduler run failed:", err.message);
    }
  });

  console.log(`[DigestScheduler] Started. Schedule: "${CRON_SCHEDULE}"`);
  cron.schedule(schedule, runDailyDigest, { timezone });

  console.log(
    `[DigestScheduler] Scheduled daily digest — cron: "${schedule}", timezone: "${timezone}"`
  );
}
