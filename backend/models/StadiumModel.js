const mongoose = require("mongoose");

const StadiumSchema = new mongoose.Schema({
  name: { type: String, required: true },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },

  location: {
    address: String,
    lat: Number,
    lng: Number,
  },

  pricePerHour: Number,

  maxPlayers: { type: Number, default: 11 },

  // ✅ Add images field
  images: {
    type: [String], // Array of image URLs
    default: []
  },

  isActive: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Stadium", StadiumSchema);