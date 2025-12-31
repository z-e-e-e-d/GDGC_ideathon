const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const Owner = require("../models/ownerModel");
const Player = require("../models/playerModel");

// Middleware: authenticate and authorize roles
// roles = array of allowed roles, e.g., ["admin", "owner"]
const auth = (roles = []) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;

      // Fetch user from the correct collection
      switch (decoded.role) {
        case "admin":
          user = await Admin.findById(decoded.id);
          break;
        case "owner":
          user = await Owner.findById(decoded.id);
          break;
        case "captain":
        case "regularPlayer":
          user = await Player.findById(decoded.id);
          break;
        default:
          return res.status(403).json({ message: "Invalid role" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Optional: prevent unverified owners from accessing certain routes
      if (
        decoded.role === "owner" &&
        user.verification?.status !== "approved"
      ) {
        return res.status(403).json({ message: "Owner account not approved" });
      }

      // Role check
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = user; // attach full user to request
      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = auth;
