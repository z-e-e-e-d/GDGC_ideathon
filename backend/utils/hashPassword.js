const bcrypt = require("bcryptjs");

// Function to hash password
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10); // salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Original password:", password);
    console.log("Hashed password:", hashedPassword);
  } catch (err) {
    console.error("Error hashing password:", err);
  }
}

// Run the script with: node hashPassword.js mypassword
const inputPassword = process.argv[2]; // get password from CLI argument
if (!inputPassword) {
  console.log("❌ Please provide a password.\nUsage: node hashPassword.js mypassword");
  process.exit(1);
}

hashPassword(inputPassword);
