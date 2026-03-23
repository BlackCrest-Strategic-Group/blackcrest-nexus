import cron from "node-cron";
import User from "../models/User.js";
import EmailPreference from "../models/EmailPreference.js";
import { sendDailyDigest } from "./emailService.js";

// Default: run at the top of every hour so each user receives their digest
// at the local hour they configured (0–23).
const CRON_SCHEDULE = process.env.DIGEST_CRON_SCHEDULE || "0 * * * *";

export function startDigestScheduler() {
  if (!cron.validate(CRON_SCHEDULE)) {
    console.error(
      `[DigestScheduler] Invalid cron expression: "${CRON_SCHEDULE}". Scheduler not started.`
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
}
