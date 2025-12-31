const express = require("express");
const {
  createStadium,
  getAllStadiums,
  getStadiumById,
  updateStadium,
  deleteStadium,
  getMyStadiums,
} = require("../controllers/stadiumController");

const auth = require("../middlewares/auth");
const router = express.Router();

// Public routes (or authenticated users can view)
router.get("/", getAllStadiums);
router.get("/:id", getStadiumById);

// Protected routes
router.post("/", auth(["owner", "admin"]), createStadium);
router.put("/:id", auth(["owner", "admin"]), updateStadium);
router.delete("/:id", auth(["owner", "admin"]), deleteStadium);

// Owner-specific route to get their own stadiums
router.get("/my/stadiums", auth(["owner"]), getMyStadiums);

module.exports = router;