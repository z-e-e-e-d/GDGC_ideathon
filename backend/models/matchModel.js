const MatchSchema = new mongoose.Schema({
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stadium",
    required: true,
  },

  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
    required: true,
  },

  teamA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },

  teamB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },

  status: {
    type: String,
    enum: ["open", "requested", "accepted", "completed"],
    default: "open",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player", // captain
  },

  createdAt: { type: Date, default: Date.now },
});
