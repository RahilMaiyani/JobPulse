const { Queue } = require('bullmq');
const redisConnection = require("../config/redis");

const resumeQueue = new Queue('resume-analysis', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 3000,
        },
        removeOnComplete: {
            age: 3600,
            count: 200,
        },
        removeOnFail: {
            age: 86400,
        }
    }
});

module.exports = resumeQueue;