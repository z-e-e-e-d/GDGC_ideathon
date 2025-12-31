const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const verifyAdmin = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ message: "No token, not authorized" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // 4. Fetch admin from DB (optional, ensures still valid)
    const admin = await Admin.findById(decoded.id || decoded._id || decoded.userId).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Attach to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error("[verifyAdmin] Error:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// verifyAdmin.js
module.exports = { verifyAdmin };

