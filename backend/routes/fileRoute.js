const express = require("express");
const path = require("path");
const fs = require("fs");
const populateUser = require("../middlewares/populateUser");
const { verifyRole } = require("../middlewares/verifyRole");

const router = express.Router();

// GET /api/files/:folder/:filename
router.get("/:folder/:filename",
  populateUser,
  verifyRole(["admin", "club", "subadmin", "user"]),
  (req, res) => {

    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, `../uploads/${folder}/${filename}`);

    const uploadsDir = path.join(__dirname, "../uploads");
    const resolvedPath = path.resolve(filePath);

    // Security check
    if (!resolvedPath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filePath);
  }
);

module.exports = router;
