const express = require("express");
const {
  createReservation,
  getReservations,
  updateReservationStatus,
  addOpponentTeam,
  selectOpponentTeam
} = require("../controllers/reservationController");

const auth = require("../middlewares/auth"); // your auth middleware
const router = express.Router();

// ===============================
// CRUD routes for reservations
// ===============================

// Create a reservation (captain/admin)
router.post("/", auth(["captain", "admin"]), createReservation);

// Get reservations (owner sees their stadiums, captain sees their team)
router.get("/", auth(["owner", "captain", "admin"]), getReservations);

// Approve or reject reservation (owner only)
router.put("/:id/status", auth(["owner"]), updateReservationStatus);

// Add a potential opponent team (if reservation not yet locked)
router.put("/:reservationId/add-opponent", auth(["captain", "admin"]), addOpponentTeam);

// Select the opponent team (locks the opponent)
router.put("/:reservationId/select-opponent", auth(["owner", "captain", "admin"]), selectOpponentTeam);

module.exports = router;
