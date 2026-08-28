const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  generateSummary,
  suggestResponse,
  analyzeIssue,
} = require("../controllers/aiController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
  },
});

router.use(authenticate);
router.use(aiLimiter);
router.post("/ai/analyze", analyzeIssue);
router.post("/:id/ai/summary", generateSummary);
router.post("/:id/ai/suggest-response", suggestResponse);

module.exports = router;
