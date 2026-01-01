const express = require("express");
const {
  createStadium,
  getAllStadiums,
  getStadiumById,
  updateStadium,
  deleteStadium,
  getMyStadiums,
  deleteStadiumImage,
} = require("../controllers/stadiumController");

const auth = require("../middlewares/auth");
const uploadStadium = require("../middlewares/multerStadium");

const router = express.Router();

// Public routes
router.get("/", getAllStadiums);
router.get("/:id", getStadiumById);

// Protected routes - with image upload
router.post(
  "/", 
  auth(["owner", "admin"]), 
  uploadStadium.array("images", 5), // Accept up to 5 images with field name "images"
  createStadium
);

router.put(
  "/:id", 
  auth(["owner", "admin"]), 
  uploadStadium.array("images", 5),
  updateStadium
);

router.delete("/:id", auth(["owner", "admin"]), deleteStadium);

// Delete single image from stadium
router.delete("/:id/image", auth(["owner", "admin"]), deleteStadiumImage);

// Owner-specific route to get their own stadiums
router.get("/my/stadiums", auth(["owner"]), getMyStadiums);

module.exports = router;