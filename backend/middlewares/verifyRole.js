const jwt = require("jsonwebtoken");

const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const token = req.cookies?.jwt;
      if (!token) {
        return res.status(401).json({ message: "No token, not authorized" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // check if role is allowed
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = decoded; // attach user info (can be club or admin)
      next();
    } catch (error) {
      console.error("[verifyRole] Error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  };
};

module.exports = { verifyRole };
