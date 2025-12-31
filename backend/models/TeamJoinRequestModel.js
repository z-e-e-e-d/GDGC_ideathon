const TeamJoinRequestSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },

  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
});
