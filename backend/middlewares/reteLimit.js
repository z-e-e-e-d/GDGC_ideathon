const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit"); // ✅ import helper

const failedLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many login attempts, please try again after 15 minutes",
    });
  },
  keyGenerator: (req) => ipKeyGenerator(req), // ✅ safe for IPv4 & IPv6
  skipSuccessfulRequests: true, // only count failed requests
});

module.exports = failedLoginLimiter;
