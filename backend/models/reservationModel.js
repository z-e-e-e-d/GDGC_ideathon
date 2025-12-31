const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    stadium: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stadium",
      required: true,
    },
    session: { type: String, required: true },
    weekday: { type: Number, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "matched", "rejected"],
      default: "pending",
    },

    notes: { type: String },

    requestingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    opponentTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],

    selectedOpponent: { type: mongoose.Schema.Types.ObjectId, ref: "Team" }, // the team picked to play

    match: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
