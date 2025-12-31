const jwt = require("jsonwebtoken");
const User = require("../models/playerModel");
const Club = require("../models/clubModel");
const Admin = require("../models/adminModel");

const populateUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated - no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the account in the right collection
    let account = null;
    if (decoded.role === "user") {
      account = await User.findById(decoded.id).select("_id");
    } else if (decoded.role === "club") {
      account = await Club.findById(decoded.id).select("_id");
    } else if (decoded.role === "admin" || decoded.role === "subadmin") {
      account = await Admin.findById(decoded.id).select("_id");
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // ✅ Trust the JWT for role, DB only for existence
    req.user = {
      id: account._id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = populateUser;
