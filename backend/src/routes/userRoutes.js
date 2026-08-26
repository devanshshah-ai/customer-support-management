const express = require("express");

const {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  remove,
} = require("../controllers/userController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const { ROLES } = require("../constants/auth");

const router = express.Router();

// All user management routes require authentication
router.use(authenticate);

// All user management routes are Admin-only
router.use(authorize(ROLES.ADMIN));

// Create a new user
router.post("/", create);

// Get all users
router.get("/", getAll);

// Get user by ID
router.get("/:id", getOne);

// Update user
router.put("/:id", update);

// Activate / deactivate user
router.patch("/:id/status", updateStatus);

// Delete user
router.delete("/:id", remove);

module.exports = router;