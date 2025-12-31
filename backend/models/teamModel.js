const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },

  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },

  players: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],

  maxPlayers: { type: Number, default: 7 },

  skillLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
  },

  createdAt: { type: Date, default: Date.now },
});
