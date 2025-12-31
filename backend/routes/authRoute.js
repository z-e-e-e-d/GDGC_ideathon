const express = require("express");
const {
  userSignup,
  verifyUserEmail,
  verifyClubEmail,
  login,
  userLogout,
  checkAuth,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  clubSignup, // ⬅️ import the new controller
  changePassword
} = require("../controllers/authController");
const loginLimiter = require("../middlewares/reteLimit");

const parser = require("../middlewares/multerLocal"); // import parser

const router = express.Router();

// ================= USER ROUTES ================= //

// User Signup
router.post("/user/signup", parser.single("photo"), userSignup);
router.get("/check", checkAuth);

// Email verification
router.get("/user/verify-email", verifyUserEmail);
router.get("/club/verify-email", verifyClubEmail);

router.get("/me", getCurrentUser);

// Login & Logout
router.post("/user/login", loginLimiter, login);
router.post("/user/logout", userLogout);

// ================= CLUB ROUTES ================= //
// ================= PASSWORD RESET ================= //
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post ("/change-password", changePassword);

// Club Signup
router.post(
  "/club/signup",
  parser.fields([
    { name: "clubLogo", maxCount: 1 },
    { name: "clubStatement", maxCount: 1 },
  ]),
  clubSignup
);

// NOTE: Club account will be created but inactive (isVerified: false)
// Admin later activates via controller function.

module.exports = router;
