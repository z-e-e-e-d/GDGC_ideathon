const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },

  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["captain", "regularPlayer"],
    default: "regularPlayer",
  },

  position: String, // GK, DEF, MID, ATT

  skillLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
  },

  age: {
    type: Number,
    min: 5,  // optional: minimum age
    max: 100, // optional: maximum age
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Player", PlayerSchema);
