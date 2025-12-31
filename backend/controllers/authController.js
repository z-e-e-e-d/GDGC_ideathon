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
    const { fullName, email, password, documentUrl } = req.body;

    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: "Owner already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    const { fullName, email, password, role, position, skillLevel } = req.body;

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
    });

    const token = generateToken(player);

    res.status(201).json({
      token,
      user: {
        id: player._id,
        role: player.role,
        fullName: player.fullName,
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

    let user = await Admin.findOne({ email });
    let userType = "admin";

    if (!user) {
      user = await Owner.findOne({ email });
      userType = "owner";
    }

    if (!user) {
      user = await Player.findOne({ email });
      userType = "player";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🚨 Owner not approved
    if (userType === "owner" && user.verification?.status !== "approved") {
      return res.status(403).json({
        message: "Owner account pending admin approval",
      });
    }

    const token = generateToken(user);

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
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
  ownerSignup,
  playerSignup,
  login,
};
