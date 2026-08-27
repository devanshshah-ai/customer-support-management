const express = require("express");

const router = express.Router();

const {
  createMessage,
  getMessagesByRequest,
} = require("../controllers/messageController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

// Every communication endpoint requires authentication
router.use(authenticate);

// POST /api/requests/:id/messages
router.post("/:id/messages", createMessage);

// GET /api/requests/:id/messages
router.get("/:id/messages", getMessagesByRequest);

module.exports = router;