const IORedis = require("ioredis")

const redisConnection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: process.env.REDIS_URL?.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
});

redisConnection.on('connect', () => {
    console.log("Connected to Redis for BullMQ")
});

redisConnection.on('error', (err) => {
    console.error("Redis Connection Error:", err.message);
});

module.exports = redisConnection;