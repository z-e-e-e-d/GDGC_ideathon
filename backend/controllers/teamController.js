const Team = require("../models/teamModel");
const Player = require("../models/playerModel");
const mongoose = require("mongoose");

// Create a new team
const createTeam = async (req, res) => {
  try {
    const { name, captain, players, maxPlayers, skillLevel } = req.body;

    // Validate captain exists
    const captainExists = await Player.findById(captain);
    if (!captainExists) {
      return res.status(404).json({ message: "Captain not found" });
    }

    const team = await Team.create({
      name,
      captain,
      players: players || [],
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
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id)
      .populate("captain", "fullName email")
      .populate("players", "fullName email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({ team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update a team
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.captain) {
      const captainExists = await Player.findById(updates.captain);
      if (!captainExists) {
        return res.status(404).json({ message: "Captain not found" });
      }
    }

    const team = await Team.findByIdAndUpdate(id, updates, { new: true });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({ message: "Team updated", team });
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

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};
