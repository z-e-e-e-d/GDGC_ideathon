const mongoose = require("mongoose");
const OwnerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },

  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    default: "owner",
  },

  // 🏟 Stadium reference (1 owner → 1 stadium)
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stadium",
  },

  // 🔐 Verification (merged)
  verification: {
    documentUrl: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    reviewedAt: Date,
  },

  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});
