import cron from "node-cron";
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

  cron.schedule(schedule, runDailyDigest, { timezone });

  console.log(
    `[DigestScheduler] Scheduled daily digest — cron: "${schedule}", timezone: "${timezone}"`
  );
}
