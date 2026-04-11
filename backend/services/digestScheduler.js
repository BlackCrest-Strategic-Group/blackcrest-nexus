/**
 * backend/services/digestScheduler.js
 *
 * Schedules and runs the daily email digest for users who have opted in.
 *
 * Bug fix (email digest not working): The previous implementation was a
 * placeholder that did nothing. This module now uses node-cron to schedule the
 * daily digest on a configurable cron expression and exports runDailyDigest so
 * it can be tested and triggered independently.
 *
 * Configuration via environment variables:
 *   DIGEST_CRON_SCHEDULE  – cron expression (default: "0 7 * * *" = 7 AM daily)
 *   DIGEST_TIMEZONE       – timezone for the cron job (default: "America/New_York")
 */

import cron from "node-cron";
import EmailPreference from "../models/EmailPreference.js";
import User from "../models/User.js";
import { sendDailyDigest } from "./emailService.js";

const DEFAULT_CRON_SCHEDULE = "0 7 * * *"; // 7:00 AM every day
const DEFAULT_TIMEZONE = "America/New_York";

/**
 * Run the daily digest: fetch all users whose email preferences are enabled,
 * filter to active accounts, and send each one a digest email.
 *
 * Errors for individual users are logged and skipped so that a single failed
 * send does not prevent the remaining users from receiving their digest.
 * Fatal errors (e.g., DB unavailable) are caught and logged without throwing,
 * so the cron job remains alive for the next scheduled run.
 */
export async function runDailyDigest() {
  try {
    // Find all email preferences that have digest delivery enabled
    const prefs = await EmailPreference.find({ enabled: true }).lean();

    if (!prefs.length) {
      console.log("[DigestScheduler] No users with digest enabled — skipping run.");
      return;
    }

    const userIds = prefs.map((p) => p.user);

    // Only send to active accounts; isActive filter is applied at the DB level
    const users = await User.find({ _id: { $in: userIds }, isActive: true }).lean();

    console.log(`[DigestScheduler] Sending digest to ${users.length} active user(s).`);

    for (const user of users) {
      try {
        await sendDailyDigest(user);
        console.log(`[DigestScheduler] Digest sent successfully to ${user.email}`);
      } catch (err) {
        // Log per-user failure and continue — one bad address must not block others
        console.error(
          `[DigestScheduler] Failed to send digest to ${user.email}:`,
          err.message
        );
      }
    }
  } catch (err) {
    // Catch fatal errors (DB down, unexpected exceptions) so the cron job
    // does not crash the process and can retry on the next scheduled tick.
    console.error("[DigestScheduler] Fatal error during digest run:", err.message);
  }
}

/**
 * Start the digest scheduler using node-cron.
 *
 * Reads DIGEST_CRON_SCHEDULE and DIGEST_TIMEZONE from the environment, falls
 * back to sensible defaults, and validates the expression before scheduling.
 */
export function startDigestScheduler() {
  const schedule = process.env.DIGEST_CRON_SCHEDULE || DEFAULT_CRON_SCHEDULE;
  const timezone = process.env.DIGEST_TIMEZONE || DEFAULT_TIMEZONE;

  if (!cron.validate(schedule)) {
    console.error(
      `[DigestScheduler] Invalid cron expression: "${schedule}". Digest scheduler not started.`
    );
    return;
  }

  cron.schedule(
    schedule,
    () => {
      console.log("[DigestScheduler] Cron fired — running daily digest...");
      runDailyDigest();
    },
    { timezone }
  );

  console.log(
    `[DigestScheduler] Scheduled daily digest with cron "${schedule}" in timezone "${timezone}".`
  );
}
