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

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },

  createdAt: { type: Date, default: Date.now },
});
