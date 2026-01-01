const express = require("express");
const {
  createTeam,
  getAllTeams,
  getMyTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  searchPlayersByEmail,
  getPlayerByEmail,
  addPlayerByEmail
} = require("../controllers/teamController");

const auth = require("../middlewares/auth")
const router = express.Router();

// CRUD routes
router.post("/", auth(["admin", "captain"]), createTeam);
router.get("/", getAllTeams);
router.get("/my-team", auth(["captain"]), getMyTeam);
router.put("/:id", auth(["admin", "captain"]), updateTeam);
router.delete("/:id", auth(["admin", "captain"]), deleteTeam);
// Captain adds a player
router.put("/:teamId/add-player", auth(["captain"]), addPlayerToTeam);
router.get("/search", auth(["admin", "captain", "player"]), searchPlayersByEmail);
router.get("/email/:email", auth(["admin", "captain", "player"]), getPlayerByEmail);
// routes/teamRoutes.js - Add the new route
router.post("/:teamId/add-by-email", auth(["captain"]), addPlayerByEmail);

module.exports = router;
