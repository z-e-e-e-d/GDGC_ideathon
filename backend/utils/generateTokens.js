const jwt = require("jsonwebtoken");

const generateToken = (res, userId, role) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set cookie
  res.cookie("jwt", token, {
    httpOnly: true, // prevent XSS
    // secure: process.env.NODE_ENV === "production", // only over HTTPS in production
    // sameSite: "strict", // CSRF protection
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    secure: process.env.NODE_ENV === "production",

    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

module.exports = generateToken;
