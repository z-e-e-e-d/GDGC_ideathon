// routes/ownerRoutes.js
const express = require("express");
const {
  getAllOwners,
  getOwnerById,
  updateVerificationStatus,
  uploadVerificationDocument,
  viewVerificationDocument,
  getDocumentInfo,
  deleteOwner,
  bulkUpdateVerification,
  exportOwners,
  getMyVerificationInfo
} = require("../controllers/ownerController");

const auth = require("../middlewares/auth");
const upload = require("../middlewares/multerLocal");
const router = express.Router();

// Admin routes - manage owners
router.get("/", auth(["admin"]), getAllOwners);
router.get("/:id", auth(["admin"]), getOwnerById);
router.delete("/:id", auth(["admin"]), deleteOwner);

// Admin verification management
router.put("/:id/verification", auth(["admin"]), updateVerificationStatus);
router.post("/bulk-verification", auth(["admin"]), bulkUpdateVerification);

// Admin document access
router.get("/:id/document", auth(["admin"]), viewVerificationDocument);
router.get("/:id/document/info", auth(["admin"]), getDocumentInfo);

// Admin export
router.get("/export/data", auth(["admin"]), exportOwners);

// Owner document upload
router.post("/upload/document", auth(["owner"]), upload.single("document"), uploadVerificationDocument);

// Owner get own verification info
router.get("/my/verification", auth(["owner"]), getMyVerificationInfo);

module.exports = router;