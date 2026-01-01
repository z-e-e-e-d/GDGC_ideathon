const bcrypt = require("bcryptjs");
const Owner = require("../models/ownerModel");
const Player = require("../models/playerModel");
const Admin = require("../models/adminModel");
const generateToken  = require("../utils/generateTokens");

// ===============================
// OWNER SIGNUP
// ===============================
const ownerSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: "Owner already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const documentUrl = req.file ? req.file.path : null;

    const owner = await Owner.create({
      fullName,
      email,
      password: hashedPassword,
      verification: {
        documentUrl,
        status: "pending",
      },
      isVerified: false,
    });

    res.status(201).json({
      message: "Signup successful. Waiting for admin approval.",
      ownerId: owner._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// PLAYER SIGNUP
// ===============================
const playerSignup = async (req, res) => {
  try {
    const { fullName, email, password, role, position, skillLevel, age } = req.body;

    const existingPlayer = await Player.findOne({ email });
    if (existingPlayer) {
      return res.status(400).json({ message: "Player already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const player = await Player.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "regularPlayer",
      position,
      skillLevel,
      age, // ✅ add this line
    });

    const token = generateToken(player);

    res.status(201).json({
      token,
      user: {
        id: player._id,
        role: player.role,
        fullName: player.fullName,
        age: player.age, // ✅ include age in the response if you want
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// LOGIN (ADMIN / OWNER / PLAYER)
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    let user = await Admin.findOne({ email });
    let userType = "admin";
    console.log("Checked Admin:", user ? "Found" : "Not found");

    if (!user) {
      user = await Owner.findOne({ email });
      userType = "owner";
      console.log("Checked Owner:", user ? "Found" : "Not found");
    }

    if (!user) {
      user = await Player.findOne({ email });
      userType = "player";
      console.log("Checked Player:", user ? "Found" : "Not found");
    }

    if (!user) {
      console.log("User not found in any collection");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🚨 Owner not approved
    if (userType === "owner" && user.verification?.status !== "approved") {
      console.log("Owner login attempt pending approval:", email);
      return res.status(403).json({
        message: "Owner account pending admin approval",
      });
    }

    const token = generateToken(user, userType);
    console.log("Login successful:", { email, userType, token });

    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        type: userType,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};


// controllers/authController.js
const logout = async (req, res) => {
  try {
    // Since JWT is stateless, we just inform the client to delete the token
    res.status(200).json({ message: "Logout successful. Please delete the token on client." });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  ownerSignup,
  playerSignup,
  login,
  logout,
};
