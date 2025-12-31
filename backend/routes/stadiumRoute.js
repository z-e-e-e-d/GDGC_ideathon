const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth"); // optional: protect routes
const {
  createStadium,
  getAllStadiums,
  getStadiumById,
  updateStadium,
  deleteStadium,
} = require("../controllers/stadiumController");

// Only admins or owners can create/update/delete
router.post("/", protect(["admin", "owner"]), createStadium);
router.get("/", getAllStadiums);
router.get("/:id", getStadiumById);
router.put("/:id", protect(["admin", "owner"]), updateStadium);
router.delete("/:id", protect(["admin", "owner"]), deleteStadium);

module.exports = router;
