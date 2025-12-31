const express = require("express");
const { changeOwnerStatus } = require("../controllers/adminController");
const auth = require("../middlewares/auth"); // merged middleware

const router = express.Router();

// Only admins can verify owners
router.put("/verify/:ownerId", auth(["admin"]), changeOwnerStatus);

module.exports = router;
