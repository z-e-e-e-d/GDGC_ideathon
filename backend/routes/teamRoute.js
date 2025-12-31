const express = require("express");
const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

const auth = require("../middlewares/auth")
const router = express.Router();

// CRUD routes
router.post("/", auth(["admin", "captain", "regularPlayer"]), createTeam);
router.get("/", getAllTeams);
router.get("/:id", getTeamById);
router.put("/:id", auth(["admin", "captain", "regularPlayer"]), updateTeam);
router.delete("/:id", auth(["admin", "captain", "regularPlayer"]), deleteTeam);

module.exports = router;
