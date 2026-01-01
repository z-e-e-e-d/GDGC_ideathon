const Stadium = require("../models/stadiumModel");
const Owner = require("../models/ownerModel");
const fs = require("fs");
const path = require("path");

// ===============================
// CREATE a Stadium
// ===============================
// controllers/stadiumController.js - Update createStadium function
const createStadium = async (req, res) => {
  try {
    // Only approved owners and admins can create stadiums
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only owners and admins can create stadiums",
      });
    }

    const { name, pricePerHour, isActive, maxPlayers, address } = req.body;
    let location = req.body.location;

    // FIX: Handle location parsing
    if (!location && address) {
      // If location is not provided but address is, create location object
      location = { address };
    } else if (typeof location === "string") {
      // If location is sent as JSON string, parse it
      try {
        location = JSON.parse(location);
      } catch (err) {
        console.error("Error parsing location JSON:", err);
        location = { address: location }; // Fallback to using string as address
      }
    }

    // If user is owner, automatically set them as the owner
    // If admin, they can specify an owner in the request body
    let ownerId;

    if (req.user.role === "owner") {
      ownerId = req.user._id;

      // Verify owner is approved
      if (req.user.verification?.status !== "approved") {
        return res.status(403).json({
          message:
            "Your owner account must be approved before creating stadiums",
        });
      }
    } else if (req.user.role === "admin") {
      // Admin can create stadium for any owner
      const { owner } = req.body;

      if (!owner) {
        return res.status(400).json({
          message: "Admin must specify an owner when creating a stadium",
        });
      }

      // Verify the specified owner exists and is approved
      const ownerExists = await Owner.findById(owner);
      if (!ownerExists) {
        return res.status(404).json({ message: "Owner not found" });
      }
      if (ownerExists.verification?.status !== "approved") {
        return res.status(403).json({
          message:
            "Owner must be approved before stadiums can be created for them",
        });
      }

      ownerId = owner;
    }

    // ✅ Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Store relative URL, NOT absolute path
        const imageUrl = `/uploads/stadiums/${file.filename}`;
        images.push(imageUrl);
        console.log("Stored image URL:", imageUrl);
      });
    }

    // FIX: Make sure location is properly structured
    const locationData =
      location && location.address
        ? {
            address: location.address,
            lat: location.lat || null,
            lng: location.lng || null,
          }
        : null;

    const stadium = await Stadium.create({
      name,
      owner: ownerId,
      location: locationData, // ✅ Use properly structured location
      pricePerHour,
      maxPlayers: maxPlayers || 11,
      images,
      isActive: isActive || false,
    });

    const populatedStadium = await Stadium.findById(stadium._id).populate(
      "owner",
      "fullName email"
    );

    res.status(201).json({
      message: "Stadium created",
      stadium: populatedStadium,
    });
  } catch (err) {
    console.error(err);

    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// GET all Stadiums
// ===============================
const getAllStadiums = async (req, res) => {
  try {
    let query = {};

    if (req.user && req.user.role === "owner") {
      // Optionally filter by owner
      // query.owner = req.user._id;
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
    const stadium = await Stadium.findById(req.params.id).populate(
      "owner",
      "fullName email"
    );

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
        message: "Only the stadium owner or admin can update this stadium",
      });
    }

    const {
      name,
      location,
      pricePerHour,
      isActive,
      owner,
      maxPlayers,
      removeImages,
    } = req.body;

    // Only admins can change the owner
    if (owner && owner !== stadium.owner.toString()) {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Only admins can change stadium ownership",
        });
      }

      const newOwner = await Owner.findById(owner);
      if (!newOwner) {
        return res.status(404).json({ message: "New owner not found" });
      }
      if (newOwner.verification?.status !== "approved") {
        return res.status(403).json({
          message: "New owner must be approved",
        });
      }

      stadium.owner = owner;
    }

    // Update other fields
    if (name) stadium.name = name;
    if (location) stadium.location = location;
    if (pricePerHour !== undefined) stadium.pricePerHour = pricePerHour;
    if (isActive !== undefined) stadium.isActive = isActive;
    if (maxPlayers !== undefined) stadium.maxPlayers = maxPlayers;

    // ✅ Handle image removal
    if (removeImages) {
      let imagesToRemove = [];

      // Parse if it's a JSON string
      if (typeof removeImages === "string") {
        try {
          imagesToRemove = JSON.parse(removeImages);
        } catch (e) {
          imagesToRemove = [removeImages];
        }
      } else if (Array.isArray(removeImages)) {
        imagesToRemove = removeImages;
      }

      imagesToRemove.forEach((imageUrl) => {
        // Remove from database array
        const index = stadium.images.indexOf(imageUrl);
        if (index > -1) {
          stadium.images.splice(index, 1);

          // Delete the file from disk
          try {
            const filename = imageUrl.split("/").pop();
            const filePath = path.join(
              __dirname,
              "..",
              "uploads",
              "stadiums",
              filename
            );
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log("Deleted image:", filename);
            }
          } catch (err) {
            console.error("Error deleting image:", err);
          }
        }
      });
    }

    // ✅ Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Check if adding new images would exceed limit (5 images max)
      const totalImages = stadium.images.length + req.files.length;
      if (totalImages > 5) {
        // Clean up newly uploaded files
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });

        return res.status(400).json({
          message: `Cannot add ${req.files.length} images. Stadium can have maximum 5 images. Currently has ${stadium.images.length}.`,
        });
      }

      req.files.forEach((file) => {
        const imageUrl = `/uploads/stadiums/${file.filename}`;
        stadium.images.push(imageUrl);
        console.log("Added new image:", imageUrl);
      });
    }

    await stadium.save();

    const updatedStadium = await Stadium.findById(stadium._id).populate(
      "owner",
      "fullName email"
    );

    res.json({ message: "Stadium updated", stadium: updatedStadium });
  } catch (err) {
    console.error(err);

    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

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
        message: "Only the stadium owner or admin can delete this stadium",
      });
    }

    // ✅ Delete all stadium images from disk
    if (stadium.images && stadium.images.length > 0) {
      stadium.images.forEach((imageUrl) => {
        try {
          const filename = imageUrl.split("/").pop();
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "stadiums",
            filename
          );
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("Deleted stadium image:", filename);
          }
        } catch (err) {
          console.error("Error deleting stadium image:", err);
        }
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
        message: "Only owners can access this endpoint",
      });
    }

    const stadiums = await Stadium.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      count: stadiums.length,
      stadiums,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// DELETE Single Stadium Image
// ===============================
const deleteStadiumImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const stadium = await Stadium.findById(id);
    if (!stadium) {
      return res.status(404).json({ message: "Stadium not found" });
    }

    // Authorization check
    const isStadiumOwner = stadium.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isStadiumOwner && !isAdmin) {
      return res.status(403).json({
        message: "Only the stadium owner or admin can delete images",
      });
    }

    // Remove image from array
    const index = stadium.images.indexOf(imageUrl);
    if (index === -1) {
      return res.status(404).json({ message: "Image not found in stadium" });
    }

    stadium.images.splice(index, 1);

    // Delete file from disk
    try {
      const filename = imageUrl.split("/").pop();
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "stadiums",
        filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    await stadium.save();

    res.json({
      message: "Image deleted successfully",
      stadium,
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
  deleteStadiumImage, // ✅ Make sure this is exported!
};
