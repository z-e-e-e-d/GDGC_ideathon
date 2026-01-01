const Team = require("../models/teamModel");
const Player = require("../models/playerModel");
const mongoose = require("mongoose");

// Create a new team
const createTeam = async (req, res) => {
  try {
    // Only logged-in captains can create a team
    // Allow both captains and admins to create teams
    if (req.user.role !== "captain" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only captains and admins can create teams" });
    }

    const { name, players, maxPlayers, skillLevel } = req.body;

    const captainId = req.user._id;

    // Automatically include captain in players array
    const teamPlayers = players
      ? [
          captainId,
          ...players.filter((p) => p.toString() !== captainId.toString()),
        ]
      : [captainId];

    const team = await Team.create({
      name,
      captain: captainId,
      players: teamPlayers,
      maxPlayers,
      skillLevel,
    });

    res.status(201).json({ message: "Team created", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all teams
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("captain", "fullName email")
      .populate("players", "fullName email");
    res.json({ teams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get team by ID
// Get team of the logged-in captain
const getMyTeam = async (req, res) => {
  try {
    // Only captains can fetch their team
    if (req.user.role !== "captain") {
      return res.status(403).json({ message: "Only captains can access their team" });
    }

    // Find team where this user is captain
    const team = await Team.findOne({ captain: req.user._id })
      .populate("captain", "fullName email position")
      .populate("players", "fullName email position");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Calculate available slots
    const availablePlayers = team.maxPlayers - team.players.length;

    // Define max positions for the team
    const positionCount = {
      GK: 1,
      DEF: 4,
      MID: 4,
      ATT: 2,
    };

    // Check which positions are still needed
    const currentPositions = team.players.map(p => p.position);
    let positionsNeeded = [];
    for (let pos in positionCount) {
      const count = currentPositions.filter(p => p === pos).length;
      if (count < positionCount[pos]) positionsNeeded.push(pos);
    }

    res.json({
      team,
      availablePlayers,
      positionsNeeded: positionsNeeded.join(", "),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Update a team
// Update a team
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the existing team first
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Authorization: Only the team's captain or an admin can update
    const isTeamCaptain = team.captain.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isTeamCaptain && !isAdmin) {
      return res.status(403).json({ 
        message: "Only the team captain or admin can update this team" 
      });
    }

    // If updating the captain, validate the new captain exists
    if (updates.captain) {
      const newCaptain = await Player.findById(updates.captain);
      if (!newCaptain) {
        return res.status(404).json({ message: "New captain not found" });
      }

      // Ensure the new captain is in the players array
      if (!team.players.includes(updates.captain)) {
        updates.players = [...(updates.players || team.players), updates.captain];
      }
    }

    // Perform the update
    const updatedTeam = await Team.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true 
    })
      .populate("captain", "fullName email")
      .populate("players", "fullName email");

    res.json({ message: "Team updated", team: updatedTeam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a team
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({ message: "Team deleted", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add a player to a team (by captain)
const addPlayerToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { playerId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Only captain can add players
    if (team.captain.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the captain can add players" });
    }

    // Check player exists
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

    // Check duplicates
    if (team.players.includes(playerId)) {
      return res.status(400).json({ message: "Player already in team" });
    }

    // Check maxPlayers limit
    if (team.players.length >= team.maxPlayers) {
      return res.status(400).json({ message: "Team is full" });
    }

    team.players.push(playerId);
    await team.save();

    res.json({ message: "Player added to team", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const searchPlayersByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email query parameter is required" });
    }

    // Search for players by email (case-insensitive, partial match)
    const players = await Player.find({
      email: { $regex: email, $options: "i" },
    }).select("fullName email position skillLevel age");

    res.json({ players });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get player by exact email
const getPlayerByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const player = await Player.findOne({ email: email.toLowerCase() }).select(
      "fullName email position skillLevel age"
    );

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json({ player });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// controllers/teamController.js - Add this function

// Add a player to a team by email
const addPlayerByEmail = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Only captain can add players
    if (team.captain.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the captain can add players" });
    }

    // Find player by email
    const player = await Player.findOne({ email: email.toLowerCase() });
    if (!player) return res.status(404).json({ message: "Player not found" });

    // Check duplicates
    if (team.players.includes(player._id)) {
      return res.status(400).json({ message: "Player already in team" });
    }

    // Check maxPlayers limit
    if (team.players.length >= team.maxPlayers) {
      return res.status(400).json({ message: "Team is full" });
    }

    // Add player to team
    team.players.push(player._id);
    await team.save();

    // Populate the player details for response
    const updatedTeam = await Team.findById(teamId)
      .populate("captain", "fullName email")
      .populate("players", "fullName email position");

    res.json({ 
      message: "Player added to team", 
      team: updatedTeam,
      addedPlayer: {
        _id: player._id,
        fullName: player.fullName,
        email: player.email,
        position: player.position
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = {
  createTeam,
  getAllTeams,
  getMyTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  searchPlayersByEmail,
  getPlayerByEmail,
  addPlayerByEmail
};
