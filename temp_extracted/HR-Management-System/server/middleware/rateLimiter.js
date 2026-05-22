import rateLimit from "express-rate-limit";


export const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: { msg: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 min
  max: 100, // Only 15 attempts per 30 min
  message: { msg: "Security limit reached. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const testLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 3, // Only 3 requests allowed every 10 seconds
  message: { msg: "Test limit reached! Wait 10 seconds." },
});