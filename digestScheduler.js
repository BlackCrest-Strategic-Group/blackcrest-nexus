const cron = require('node-cron');

// Load the cron schedule from the environment variable
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 * * * *'; // Default: every hour

// Validate the cron schedule
if (!cron.validate(CRON_SCHEDULE)) {
  console.error(`[DigestScheduler] Invalid cron expression: "${CRON_SCHEDULE}". Scheduler not started.`);
} else {
  cron.schedule(CRON_SCHEDULE, () => {
    console.log('Scheduler is running...');
    // Your task logic here
  });
  console.log(`[DigestScheduler] Scheduler started with cron expression: "${CRON_SCHEDULE}".`);
}