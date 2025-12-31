const User = require("../models/playerModel");
const Club = require("../models/clubModel");
const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateTokens");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail"); // helper to send emails
const jwt = require("jsonwebtoken");

// ----------------- Club Signup -----------------
const clubSignup = async (req, res) => {
  console.log("➡️ req.body:", req.body);
  console.log("➡️ req.files:", req.files);

  try {
    const {
      username,
      email,
      password,
      clubName,
      clubAddress,
      clubPhoneNumber,
      clubSport,
      responsibleFullName,
      responsibleBirthday,
    } = req.body;

    // Check uniqueness
    const emailExists =
      (await User.findOne({ email })) ||
      (await Club.findOne({ email })) ||
      (await Admin.findOne({ email }));
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const usernameExists =
      (await User.findOne({ username })) ||
      (await Club.findOne({ username })) ||
      (await Admin.findOne({ username }));
    if (usernameExists) {
      return res.status(400).json({ message: "Username already in use" });
    }

    // Validate responsible person
    if (!responsibleFullName || !responsibleBirthday) {
      return res
        .status(400)
        .json({ message: "Responsible person info is required" });
    }

    const age = Math.floor(
      (Date.now() - new Date(responsibleBirthday).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    );

    if (age < 18) {
      return res
        .status(400)
        .json({ message: "Responsible person must be at least 18 years old" });
    }

    // 🖼️ Handle club logo path (file system)
    let logoUrl = "";
    if (req.files?.clubLogo?.[0]) {
      const logoFile = req.files.clubLogo[0];
      const isDoc =
        logoFile.mimetype.includes("pdf") || logoFile.mimetype.includes("doc");
      const folder = isDoc ? "docs" : "images";
      logoUrl = `/uploads/${folder}/${logoFile.filename}`;
    }

    // 📄 Handle club statement path (file system)
    let statementUrl = "";
    if (req.files?.clubStatement?.[0]) {
      const statementFile = req.files.clubStatement[0];
      const folder =
        statementFile.mimetype.includes("pdf") ||
        statementFile.mimetype.includes("doc")
          ? "docs"
          : "images";
      statementUrl = `/uploads/${folder}/${statementFile.filename}`;
    }

    // Verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    // ✅ Do NOT hash here — schema pre("save") handles it
    const club = await Club.create({
      username,
      email,
      password, // raw password → schema hook will hash
      clubName,
      clubAddress,
      clubPhoneNumber,
      clubLogo: logoUrl,
      clubStatement: statementUrl,
      clubSport,
      responsibleFullName,
      responsibleBirthday,
      isVerified: false,
      adminApproved: false,
      verifyToken,
      verifyTokenExpires,
    });

    // Send verification email
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}&id=${club._id}&type=club`;
    const message = `
      <h1>Email Verification</h1>
      <p>Hi ${club.clubName},</p>
      <p>Please click the link below to verify your club account:</p>
      <a href="${verifyLink}" target="_blank">Verify Email</a>
    `;
    await sendEmail(club.email, "Verify your email", message);

    res.status(201).json({
      message:
        "Club registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("❌ Club signup failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ----------------- User Signup -----------------
const userSignup = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      placeOfBirth,
      phoneNumber,
      groupage,
      gender,
      isSick,
    } = req.body;

    // Check email uniqueness across all collections
    const emailExists =
      (await User.findOne({ email })) ||
      (await Club.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check username uniqueness across all collections
    const usernameExists =
      (await User.findOne({ username })) ||
      (await Club.findOne({ username })) ||
      (await Admin.findOne({ username }));

    if (usernameExists) {
      return res.status(400).json({ message: "Username already in use" });
    }

    // 🖼️ Handle photo path (file system instead of Cloudinary)
    let photoUrl = "";
    if (req.file) {
      const isDoc =
        req.file.mimetype.includes("pdf") || req.file.mimetype.includes("doc");
      const folder = isDoc ? "docs" : "images";
      photoUrl = `/uploads/${folder}/${req.file.filename}`;
    }

    // Generate verification token and expiry (24h)
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    // Create user but not verified yet
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      gender,
      photo: photoUrl,
      dateOfBirth,
      placeOfBirth,
      phoneNumber,
      groupage,
      isSick: isSick || false,
      isVerified: false,
      verifyToken,
      verifyTokenExpires,
    });

    // Send verification email
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}&id=${user._id}&type=user`;

    const message = `
      <h1>Email Verification</h1>
      <p>Hi ${user.firstName},</p>
      <p>Please click the link below to verify your account:</p>
      <a href="${verifyLink}" target="_blank">Verify Email</a>
    `;
    await sendEmail(user.email, "Verify your email", message);

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const checkAuth = async (req, res) => {
  try {
    console.log("[checkAuth] Cookies received:", req.cookies);

    const token = req.cookies?.jwt;
    if (!token) {
      console.warn("[checkAuth] No token found in cookies");
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    console.log("[checkAuth] Token found, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[checkAuth] Decoded token:", decoded);

    return res
      .status(200)
      .json({ success: true, message: "Authenticated", user: decoded });
  } catch (error) {
    console.error("[checkAuth] Token verification failed:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

// ----------------- Email Verification -----------------
const verifyUserEmail = async (req, res) => {
  try {
    const { token, id } = req.query;
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "Invalid link" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.verifyToken !== token || Date.now() > user.verifyTokenExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ----------------- Verify Club Email -----------------
// controllers/authController.js
const verifyClubEmail = async (req, res) => {
  try {
    const { token, id } = req.query;
    const club = await Club.findById(id);

    if (!club) return res.status(400).json({ message: "Invalid link" });
    if (club.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    if (club.verifyToken !== token || Date.now() > club.verifyTokenExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    club.isVerified = true; // ✅ email confirmed
    club.verifyToken = undefined;
    club.verifyTokenExpires = undefined;
    await club.save();

    res.status(200).json({
      message: "Club email verified successfully. Pending admin approval.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ----------------- Login -----------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let account = null;
    let role = null;

    // 1️⃣ Check User collection
    const user = await User.findOne({ email });
    if (user) {
      account = user;
      role = "user";
    }

    // 2️⃣ Check Club collection
    if (!account) {
      const club = await Club.findOne({ email });
      if (club) {
        account = club;
        role = "club";
      }
    }

    // 3️⃣ Check Admin collection
    if (!account) {
      const admin = await Admin.findOne({ email });
      if (admin) {
        account = admin;
        role = admin.role; // "admin" or "subadmin" from DB
      }
    }

    // ❌ No account found
    if (!account) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Verification checks
    if (role === "user" && !account.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    if (role === "club") {
      if (!account.isVerified) {
        return res
          .status(400)
          .json({ message: "Please verify your email first" });
      }
      if (!account.adminApproved) {
        return res.status(403).json({ message: "Waiting for admin approval" });
      }
    }

    // 🔹 Password validation
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔹 Generate JWT with correct role
    const token = generateToken(res, account._id, role);

    // 🔹 Respond with account info
    res.status(200).json({
      _id: account._id,
      username: account.username,
      email: account.email,
      role, // "user" | "club" | "admin" | "subadmin"
      permissions: account.permissions || [], // for admin/sub-admin
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let account = null;

    // Check User collection
    const user = await User.findById(decoded.id).select("_id username email");
    if (user) {
      account = { ...user.toObject(), role: "user" };
    }

    // Check Club collection
    const club = await Club.findById(decoded.id).select(
      "_id username email clubName"
    );
    if (club) {
      account = { ...club.toObject(), role: "club" };
    }

    // Admin (could be admin or subadmin)
    const admin = await Admin.findById(decoded.id).select(
      "_id username email role permissions"
    );
    if (admin) {
      account = { ...admin.toObject(), role: admin.role || "admin" };
    }

    if (!account) return res.status(404).json({ message: "Account not found" });

    res.json(account);
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
// controllers/authController.js
// ================= PASSWORD RESET CONTROLLERS ================= //// Fixed resetPassword function
const resetPassword = async (req, res) => {
  try {
    const { id, token, newPassword } = req.body;

    // Validate input
    if (!id || !token || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Hash incoming token to compare with stored hash
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("Looking for account with:", {
      id,
      resetTokenHash,
      currentTime: Date.now(),
    });

    // Look in all collections for valid reset token
    let account = null;
    let accountType = null;

    // Check User collection
    account = await User.findOne({
      _id: id,
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (account) accountType = "User";

    // Check Club collection if not found in User
    if (!account) {
      account = await Club.findOne({
        _id: id,
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: { $gt: Date.now() },
      });
      if (account) accountType = "Club";
    }

    // Check Admin collection if not found in Club
    if (!account) {
      account = await Admin.findOne({
        _id: id,
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: { $gt: Date.now() },
      });
      if (account) accountType = "Admin";
    }

    if (!account) {
      console.log("No account found or token expired");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log(`Found ${accountType} account:`, account.email);

    // Clear reset token fields first
    account.resetPasswordToken = undefined;
    account.resetPasswordExpire = undefined;

    // Set new password (this will trigger the pre-save hook to hash it)
    account.password = newPassword;

    // Save the account (pre-save hook will hash the password)
    await account.save();

    console.log("Password reset successful for:", account.email);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Also, make sure your forgotPassword function is correctly saving the hashed token
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("Looking for account with email:", email);

    // Try finding in all models
    let account = null;
    let accountType = null;

    account = await User.findOne({ email });
    if (account) accountType = "User";

    if (!account) {
      account = await Club.findOne({ email });
      if (account) accountType = "Club";
    }

    if (!account) {
      account = await Admin.findOne({ email });
      if (account) accountType = "Admin";
    }

    if (!account) {
      console.log("No account found with email:", email);
      return res.status(404).json({ message: "Account not found" });
    }

    console.log(`Found ${accountType} account:`, account.email);

    // Generate reset token (plain text)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving to database
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log("Generated tokens:", {
      resetToken: resetToken.substring(0, 10) + "...",
      resetTokenHash: resetTokenHash.substring(0, 10) + "...",
    });

    // Save hashed token + expiry (15 minutes)
    account.resetPasswordToken = resetTokenHash;
    account.resetPasswordExpire = Date.now() + 1000 * 60 * 15; // 15 min
    await account.save();

    // Reset URL with plain token (not hashed)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${account._id}`;

    // Email content
    const message = `
      <h1>Password Reset Request</h1>
      <p>Hello ${account.username || account.email},</p>
      <p>You requested to reset your password. Click the link below to set a new one (valid for 15 minutes):</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    // Send the email
    await sendEmail(account.email, "Password Reset Request", message);

    console.log("Reset email sent to:", account.email);

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------- Logout -----------------
const userLogout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.cookies.jwt;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find account in all collections
    let account =
      (await User.findById(decoded.id)) ||
      (await Club.findById(decoded.id)) ||
      (await Admin.findById(decoded.id));

    if (!account) return res.status(404).json({ message: "Account not found" });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, account.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // Set new password
    account.password = newPassword;
    await account.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  userSignup,
  verifyUserEmail,
  verifyClubEmail,
  login,
  userLogout,
  checkAuth,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  clubSignup,
  changePassword,
};
