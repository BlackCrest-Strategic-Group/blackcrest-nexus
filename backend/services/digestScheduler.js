// Refactored code for digestScheduler.js

// Sample refactored content

const schedule = require('node-schedule');
const logger = require('../logger');
const DigestService = require('./DigestService');

class DigestScheduler {
    constructor() {
        this.schedulers = [];
    }

    scheduleDigest(digestTime) {
        const job = schedule.scheduleJob(digestTime, async () => {
            try {
                logger.info('Digest job started');
                await DigestService.sendDigest();
                logger.info('Digest job completed');
            } catch (error) {
                logger.error(`Digest job failed: ${error.message}`);
            }
        });
        this.schedulers.push(job);
    }

    cancelDigest(job) {
        job.cancel();
        this.schedulers = this.schedulers.filter(scheduler => scheduler !== job);
    }

    cancelAllDigests() {
        this.schedulers.forEach(job => job.cancel());
        this.schedulers = [];
    }
}

module.exports = new DigestScheduler();