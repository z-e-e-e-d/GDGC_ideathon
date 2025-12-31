const express = require("express");
const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addPlayerToTeam
} = require("../controllers/teamController");

const auth = require("../middlewares/auth")
const router = express.Router();

// CRUD routes
router.post("/", auth(["admin", "captain"]), createTeam);
router.get("/", getAllTeams);
router.get("/:id", getTeamById);
router.put("/:id", auth(["admin", "captain"]), updateTeam);
router.delete("/:id", auth(["admin", "captain"]), deleteTeam);
// Captain adds a player
router.put("/:teamId/add-player", auth(["captain"]), addPlayerToTeam);

module.exports = router;
