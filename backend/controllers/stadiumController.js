const Stadium = require("../models/stadiumModel");
const Owner = require("../models/ownerModel");

// ===============================
// CREATE a Stadium
// ===============================
const createStadium = async (req, res) => {
  try {
    // Only approved owners and admins can create stadiums
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "Only owners and admins can create stadiums" 
      });
    }

    const { name, location, pricePerHour, isActive } = req.body;

    // If user is owner, automatically set them as the owner
    // If admin, they can specify an owner in the request body
    let ownerId;
    
    if (req.user.role === "owner") {
      ownerId = req.user._id;
      
      // Verify owner is approved
      if (req.user.verification?.status !== "approved") {
        return res.status(403).json({ 
          message: "Your owner account must be approved before creating stadiums" 
        });
      }
    } else if (req.user.role === "admin") {
      // Admin can create stadium for any owner
      const { owner } = req.body;
      
      if (!owner) {
        return res.status(400).json({ 
          message: "Admin must specify an owner when creating a stadium" 
        });
      }

      // Verify the specified owner exists and is approved
      const ownerExists = await Owner.findById(owner);
      if (!ownerExists) {
        return res.status(404).json({ message: "Owner not found" });
      }
      if (ownerExists.verification?.status !== "approved") {
        return res.status(403).json({ 
          message: "Owner must be approved before stadiums can be created for them" 
        });
      }
      
      ownerId = owner;
    }

    const stadium = await Stadium.create({
      name,
      owner: ownerId,
      location,
      pricePerHour,
      isActive: isActive || false,
    });

    const populatedStadium = await Stadium.findById(stadium._id)
      .populate("owner", "fullName email");

    res.status(201).json({ 
      message: "Stadium created", 
      stadium: populatedStadium 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// GET all Stadiums
// ===============================
const getAllStadiums = async (req, res) => {
  try {
    // Optional: Filter by owner if the requesting user is an owner
    let query = {};
    
    if (req.user && req.user.role === "owner") {
      // Owners can see all stadiums, but you might want to add filtering
      // query.owner = req.user._id; // Uncomment to show only their stadiums
    }

    const stadiums = await Stadium.find(query)
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 });
      
    res.json({ stadiums });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// GET Stadium by ID
// ===============================
const getStadiumById = async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id)
      .populate("owner", "fullName email");

    if (!stadium) {
      return res.status(404).json({ message: "Stadium not found" });
    }

    res.json({ stadium });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
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

    // Authorization: Only the stadium's owner or an admin can update
    const isStadiumOwner = stadium.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isStadiumOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "Only the stadium owner or admin can update this stadium" 
      });
    }

    const { name, location, pricePerHour, isActive, owner } = req.body;

    // Only admins can change the owner
    if (owner && owner !== stadium.owner.toString()) {
      if (req.user.role !== "admin") {
        return res.status(403).json({ 
          message: "Only admins can change stadium ownership" 
        });
      }

      // Verify new owner exists and is approved
      const newOwner = await Owner.findById(owner);
      if (!newOwner) {
        return res.status(404).json({ message: "New owner not found" });
      }
      if (newOwner.verification?.status !== "approved") {
        return res.status(403).json({ 
          message: "New owner must be approved" 
        });
      }

      stadium.owner = owner;
    }

    // Update other fields
    if (name) stadium.name = name;
    if (location) stadium.location = location;
    if (pricePerHour !== undefined) stadium.pricePerHour = pricePerHour;
    if (isActive !== undefined) stadium.isActive = isActive;

    await stadium.save();

    const updatedStadium = await Stadium.findById(stadium._id)
      .populate("owner", "fullName email");

    res.json({ message: "Stadium updated", stadium: updatedStadium });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
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

    // Authorization: Only the stadium's owner or an admin can delete
    const isStadiumOwner = stadium.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isStadiumOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "Only the stadium owner or admin can delete this stadium" 
      });
    }

    await stadium.deleteOne();

    res.json({ message: "Stadium deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// GET Stadiums by Owner (for owner dashboard)
// ===============================
const getMyStadiums = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ 
        message: "Only owners can access this endpoint" 
      });
    }

    const stadiums = await Stadium.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ 
      count: stadiums.length,
      stadiums 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
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
  getMyStadiums,
};