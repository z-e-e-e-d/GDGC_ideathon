const Stadium = require("../models/stadiumModel");

// ===============================
// CREATE a Stadium
// ===============================
const createStadium = async (req, res) => {
  try {
    const { name, owner, location, pricePerHour, isActive } = req.body;

    const stadium = await Stadium.create({
      name,
      owner,
      location,
      pricePerHour,
      isActive: isActive || false,
    });

    res.status(201).json({ message: "Stadium created", stadium });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GET all Stadiums
// ===============================
const getAllStadiums = async (req, res) => {
  try {
    const stadiums = await Stadium.find().populate("owner", "fullName email");
    res.json({ stadiums });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GET Stadium by ID
// ===============================
const getStadiumById = async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id).populate(
      "owner",
      "fullName email"
    );

    if (!stadium) {
      return res.status(404).json({ message: "Stadium not found" });
    }

    res.json({ stadium });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// UPDATE a Stadium
// ===============================
const updateStadium = async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ message: "Stadium not found" });
    }

    const { name, owner, location, pricePerHour, isActive } = req.body;

    stadium.name = name || stadium.name;
    stadium.owner = owner || stadium.owner;
    stadium.location = location || stadium.location;
    stadium.pricePerHour = pricePerHour || stadium.pricePerHour;
    stadium.isActive = isActive !== undefined ? isActive : stadium.isActive;

    await stadium.save();

    res.json({ message: "Stadium updated", stadium });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// DELETE a Stadium
// ===============================
const deleteStadium = async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ message: "Stadium not found" });
    }

    await stadium.deleteOne();

    res.json({ message: "Stadium deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
  createStadium,
  getAllStadiums,
  getStadiumById,
  updateStadium,
  deleteStadium,
};
