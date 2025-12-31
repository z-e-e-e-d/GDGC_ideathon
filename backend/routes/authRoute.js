const express = require("express");
const {
  ownerSignup,
  playerSignup,
  login,
  logout
} = require("../controllers/authController");
const upload = require("../middlewares/multerLocal");


const router = express.Router();

router.post("/signup/owner", upload.single("file"), ownerSignup);
router.post("/signup/player", playerSignup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
