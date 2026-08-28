const express = require("express");

const {
  generateSummary,
  suggestResponse,
  analyzeIssue,
} = require("../controllers/aiController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);
router.post("/ai/analyze", analyzeIssue);
router.post("/:id/ai/summary", generateSummary);
router.post("/:id/ai/suggest-response", suggestResponse);

module.exports = router;
