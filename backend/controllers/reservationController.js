const Reservation = require("../models/reservationModel");
const Stadium = require("../models/stadiumModel");
const Team = require("../models/teamModel");
const Match = require("../models/matchModel");

// ===============================
// CREATE a reservation
// ===============================
const createReservation = async (req, res) => {
  try {
    if (req.user.role !== "captain" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only captains can create reservations" });
    }

    const { stadiumId, session, weekday, notes } = req.body;

    const stadium = await Stadium.findById(stadiumId);
    if (!stadium) {
      return res.status(404).json({ message: "Stadium not found" });
    }

    // 🔑 Find captain's team
    const team = await Team.findOne({ captain: req.user._id });
    if (!team) {
      return res
        .status(400)
        .json({ message: "You must be a captain of a team" });
    }

    // Check slot availability
    const existingReservation = await Reservation.findOne({
      stadium: stadiumId,
      weekday,
      session,
      status: { $in: ["pending", "approved"] },
    });

    if (existingReservation) {
      return res.status(400).json({
        message: "This stadium is already reserved at this day and time slot",
      });
    }

    const reservation = await Reservation.create({
      stadium: stadiumId,
      session,
      weekday,
      owner: stadium.owner,
      notes,
      requestingTeam: team._id, // ✅ GUARANTEED
      opponentTeams: [],
      selectedOpponent: null,
    });

    res.status(201).json({ message: "Reservation created", reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// GET reservations
// ===============================
const getReservations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "owner") {
      query.owner = req.user._id; // Owner sees reservations for their stadiums
    } else if (req.user.role === "captain") {
      query.requestingTeam = req.user.teamId; // Captain sees their own team's reservations
    }

    const reservations = await Reservation.find(query)
      .populate("stadium", "name location")
      .populate("requestingTeam", "name")
      .populate("opponentTeams", "name")
      .populate("match")
      .sort({ createdAt: -1 });

    res.json({ reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// APPROVE or REJECT reservation (owner)
// ===============================
const updateReservationStatus = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Only owners can approve/reject reservations" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation)
      return res.status(404).json({ message: "Reservation not found" });

    if (reservation.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only manage your own stadium reservations" });
    }

    reservation.status = status;
    await reservation.save();

    let match = null;

    // ✅ Create match only if approved and selectedOpponent exists
    if (status === "approved" && reservation.selectedOpponent) {
      match = await Match.create({
        stadium: reservation.stadium,
        slot: reservation._id, // or your actual slot ID if you have a Slot model
        teamA: reservation.requestingTeam,
        teamB: reservation.selectedOpponent,
        status: "open",
        createdBy: req.user._id, // owner who approved
      });

      reservation.match = match._id;
      await reservation.save();
    }

    res.json({
      message: `Reservation ${status}` + (match ? " and match created" : ""),
      reservation,
      match,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// ADD opponent team to a reservation
// ===============================
const addOpponentTeam = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { teamId } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation)
      return res.status(404).json({ message: "Reservation not found" });

    // If a specific opponent is already selected, no other teams can join
    if (reservation.selectedOpponent) {
      return res.status(400).json({
        message:
          "Opponent already selected. No other teams can join this reservation.",
      });
    }

    // Check if team is already in the list
    if (reservation.opponentTeams.includes(teamId)) {
      return res
        .status(400)
        .json({ message: "Team already requested to join" });
    }

    reservation.opponentTeams.push(teamId);
    await reservation.save();

    res.json({ message: "Team added to potential opponents", reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// SELECT an opponent team (by requesting team or owner/AI)
// ===============================
const selectOpponentTeam = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { teamId } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.selectedOpponent) {
      return res.status(400).json({ message: "Opponent already selected" });
    }
    console.log("Opponent teams:", reservation.opponentTeams);
    console.log("Incoming teamId:", teamId);
    if (!reservation.opponentTeams.includes(teamId)) {
      return res
        .status(400)
        .json({ message: "Team is not in potential opponents" });
    }

    reservation.selectedOpponent = teamId;
    reservation.status = "matched"; // 🔒 LOCK IT
    await reservation.save();

    res.json({
      message: "Opponent selected and reservation locked",
      reservation,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createReservation,
  getReservations,
  updateReservationStatus,
  addOpponentTeam,
  selectOpponentTeam,
};
