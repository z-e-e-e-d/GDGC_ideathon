const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") }); // <-- ensure correct path
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/adminModel");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("StrongPassword123!", 10);

    const admin = await Admin.create({
      fullName: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
    });

    console.log("Admin created:", admin);
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

seedAdmin();
