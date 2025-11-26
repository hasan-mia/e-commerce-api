const rateLimit = require("express-rate-limit");
const { sendResponse } = require("../utils/utils");

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 requests per 15 minutes
  message: {
    success: false,
    message: "Too many OTP requests, please try again later.",
  },
});

module.exports = otpRateLimiter;
