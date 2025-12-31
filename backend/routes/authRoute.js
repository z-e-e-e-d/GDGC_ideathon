const express = require("express");
const {
  ownerSignup,
  playerSignup,
  login,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup/owner", ownerSignup);
router.post("/signup/player", playerSignup);
router.post("/login", login);

module.exports = router;
