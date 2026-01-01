// controllers/ownerController.js
const Owner = require("../models/ownerModel");
const Admin = require("../models/adminModel");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Get all owners with filtering
const getAllOwners = async (req, res) => {
  try {
    const { search, verificationStatus } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Verification status filter
    if (verificationStatus && verificationStatus !== "all") {
      if (verificationStatus === "verified") {
        query.isVerified = true;
      } else if (verificationStatus === "unverified") {
        query.isVerified = false;
      } else if (["pending", "approved", "rejected"].includes(verificationStatus)) {
        query["verification.status"] = verificationStatus;
      }
    }

    const owners = await Owner.find(query)
      .select("-password")
      .populate({
        path: "verification.reviewedBy",
        select: "fullName email",
      })
      .sort({ createdAt: -1 });

    // Get statistics
    const stats = {
      total: await Owner.countDocuments(),
      verified: await Owner.countDocuments({ isVerified: true }),
      pending: await Owner.countDocuments({ "verification.status": "pending" }),
      approved: await Owner.countDocuments({ "verification.status": "approved" }),
      rejected: await Owner.countDocuments({ "verification.status": "rejected" }),
    };

    res.json({
      success: true,
      data: owners,
      count: owners.length,
      stats,
    });
  } catch (error) {
    console.error("Get all owners error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch owners",
    });
  }
};

// Get single owner by ID
const getOwnerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid owner ID",
      });
    }

    const owner = await Owner.findById(id)
      .select("-password")
      .populate({
        path: "verification.reviewedBy",
        select: "fullName email",
      });

    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found",
      });
    }

    res.json({
      success: true,
      data: owner,
    });
  } catch (error) {
    console.error("Get owner by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch owner",
    });
  }
};

// Update owner verification status
const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid owner ID",
      });
    }

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    const owner = await Owner.findById(id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found",
      });
    }

    // Check if owner has uploaded verification document
    if (!owner.verification.documentUrl) {
      return res.status(400).json({
        success: false,
        error: "Owner has not uploaded verification document",
      });
    }

    // Update verification status
    owner.verification.status = status;
    owner.verification.reviewedBy = req.user.id; // Admin ID from auth middleware
    owner.verification.reviewedAt = new Date();
    owner.isVerified = status === "approved";
    
    // Add notes if provided
    if (notes) {
      owner.verification.notes = notes;
    }

    await owner.save();

    // Get the updated owner with populated reviewer info
    const updatedOwner = await Owner.findById(id)
      .select("-password")
      .populate({
        path: "verification.reviewedBy",
        select: "fullName email",
      });

    res.json({
      success: true,
      message: `Owner verification ${status} successfully`,
      data: updatedOwner,
    });
  } catch (error) {
    console.error("Update verification status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update verification status",
    });
  }
};

// Upload verification document (from owner side)
const uploadVerificationDocument = async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Validate file type (only allow PDF, JPG, PNG)
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      // Delete uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid file type. Only PDF, JPG, and PNG are allowed",
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "File size too large. Maximum size is 5MB",
      });
    }

    const owner = await Owner.findById(req.user.id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found",
      });
    }

    // If there's an existing document, delete it
    if (owner.verification.documentUrl) {
      const oldFilePath = path.join(
        __dirname,
        "..",
        owner.verification.documentUrl.replace(/^\//, "")
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update owner document URL
    owner.verification.documentUrl = `/uploads/docs/${file.filename}`;
    owner.verification.status = "pending"; // Reset status to pending
    owner.isVerified = false; // Reset verification status

    await owner.save();

    res.json({
      success: true,
      message: "Verification document uploaded successfully",
      data: {
        documentUrl: owner.verification.documentUrl,
        status: owner.verification.status,
      },
    });
  } catch (error) {
    console.error("Upload verification document error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload verification document",
    });
  }
};

// View verification document (admin only)
const viewVerificationDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid owner ID",
      });
    }

    const owner = await Owner.findById(id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found",
      });
    }

    if (!owner.verification.documentUrl) {
      return res.status(404).json({
        success: false,
        error: "No verification document uploaded",
      });
    }

    const filePath = path.join(
      __dirname,
      "..",
      owner.verification.documentUrl.replace(/^\//, "")
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Verification document not found",
      });
    }

    // Get file info
    const fileStats = fs.statSync(filePath);
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Determine content type
    let contentType = "application/octet-stream";
    if (fileExt === ".pdf") contentType = "application/pdf";
    if (fileExt === ".jpg" || fileExt === ".jpeg") contentType = "image/jpeg";
    if (fileExt === ".png") contentType = "image/png";

    // Send file
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", fileStats.size);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(filePath)}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("View verification document error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to view verification document",
    });
  }
};

// Get verification document info
const getDocumentInfo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid owner ID",
      });
    }

    const owner = await Owner.findById(id)
      .select("verification fullName email")
      .populate({
        path: "verification.reviewedBy",
        select: "fullName email",
      });

    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found",
      });
    }

    if (!owner.verification.documentUrl) {
      return res.json({
        success: true,
        data: null,
        message: "No verification document uploaded",
      });
    }

    const filePath = path.join(
      __dirname,
      "..",
      owner.verification.documentUrl.replace(/^\//, "")
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Verification document file not found",
      });
    }

    const fileStats = fs.statSync(filePath);
    const fileExt = path.extname(filePath).toLowerCase();

    const documentInfo = {
      url: owner.verification.documentUrl,
      fileName: path.basename(filePath),
      fileSize: fileStats.size,
      fileType: fileExt.replace(".", "").toUpperCase(),
      uploadedAt: owner.createdAt,
      status: owner.verification.status,
      reviewedBy: owner.verification.reviewedBy,
      reviewedAt: owner.verification.reviewedAt,
    };

    res.json({
      success: true,
      data: documentInfo,
    });
  } catch (error) {
    console.error("Get document info error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get document info",
    });
  }
};

// Delete owner (admin only)
const deleteOwner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid owner ID",
      });
    }

    const owner = await Owner.findById(id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found",
      });
    }

    // Delete verification document if exists
    if (owner.verification.documentUrl) {
      const filePath = path.join(
        __dirname,
        "..",
        owner.verification.documentUrl.replace(/^\//, "")
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Owner.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Owner deleted successfully",
    });
  } catch (error) {
    console.error("Delete owner error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete owner",
    });
  }
};

// Bulk update verification status
const bulkUpdateVerification = async (req, res) => {
  try {
    const { ownerIds, status, notes } = req.body;

    if (!Array.isArray(ownerIds) || ownerIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No owner IDs provided",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    // Validate all IDs
    const invalidIds = ownerIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid owner IDs: ${invalidIds.join(", ")}`,
      });
    }

    // Update all owners
    const updateData = {
      "verification.status": status,
      "verification.reviewedBy": req.user.id,
      "verification.reviewedAt": new Date(),
      isVerified: status === "approved",
    };

    if (notes) {
      updateData["verification.notes"] = notes;
    }

    const result = await Owner.updateMany(
      { _id: { $in: ownerIds } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} owners updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Bulk update verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update verification statuses",
    });
  }
};

// Export owner data (for admin reports)
const exportOwners = async (req, res) => {
  try {
    const { format = "json" } = req.query;

    const owners = await Owner.find()
      .select("-password")
      .populate({
        path: "verification.reviewedBy",
        select: "fullName email",
      })
      .sort({ createdAt: -1 });

    if (format === "csv") {
      // Convert to CSV format
      const headers = [
        "ID",
        "Full Name",
        "Email",
        "Verification Status",
        "Is Verified",
        "Reviewed By",
        "Reviewed At",
        "Created At",
      ];

      const csvData = owners.map((owner) => [
        owner._id,
        owner.fullName,
        owner.email,
        owner.verification.status,
        owner.isVerified,
        owner.verification.reviewedBy
          ? owner.verification.reviewedBy.fullName
          : "",
        owner.verification.reviewedAt || "",
        owner.createdAt,
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=owners_${new Date().toISOString().split("T")[0]}.csv`
      );
      return res.send(csvContent);
    }

    // Default to JSON
    res.json({
      success: true,
      data: owners,
      count: owners.length,
      exportedAt: new Date(),
    });
  } catch (error) {
    console.error("Export owners error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export owners",
    });
  }
};

// Get owner's own verification info
const getMyVerificationInfo = async (req, res) => {
  try {
    const owner = await Owner.findById(req.user.id)
      .select("verification fullName email createdAt")
      .populate({
        path: "verification.reviewedBy",
        select: "fullName email",
      });

    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found",
      });
    }

    res.json({
      success: true,
      data: owner,
    });
  } catch (error) {
    console.error("Get verification info error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch verification info",
    });
  }
};

module.exports = {
  getAllOwners,
  getOwnerById,
  updateVerificationStatus,
  uploadVerificationDocument,
  viewVerificationDocument,
  getDocumentInfo,
  deleteOwner,
  bulkUpdateVerification,
  exportOwners,
  getMyVerificationInfo,
};