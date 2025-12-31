const Owner = require("../models/ownerModel");
const Admin = require("../models/adminModel");
const mongoose = require("mongoose");

// Change owner verification status
const changeOwnerStatus = async (req, res) => {
  try {
    const { ownerId } = req.params; // ID of the owner
    const { status } = req.body;    // "approved" or "rejected"
    const adminId = req.user.id;    // from your protect middleware

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Check owner exists
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Update verification
    owner.verification.status = status;
    owner.verification.reviewedBy = new mongoose.Types.ObjectId(adminId);
    owner.verification.reviewedAt = new Date();
    owner.isVerified = status === "approved";

    await owner.save();

    res.json({
      message: `Owner verification status changed to ${status}`,
      owner,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { changeOwnerStatus };
