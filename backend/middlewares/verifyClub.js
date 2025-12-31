// middlewares/verifyClub.js
const jwt = require("jsonwebtoken");
const Club = require("../models/clubModel");

const verifyClub = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ message: "No token, not authorized" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check role
    if (decoded.role !== "club") {
      return res.status(403).json({ message: "Access denied. Clubs only." });
    }

    // 4. Fetch club from DB (optional, ensures still valid)
    const club = await Club.findById(decoded.id || decoded._id || decoded.userId).select("-password");
    if (!club) {
      return res.status(401).json({ message: "Club not found" });
    }

    // Attach club info to request
    req.club = club;
    next();
  } catch (error) {
    console.error("[verifyClub] Error:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { verifyClub };
