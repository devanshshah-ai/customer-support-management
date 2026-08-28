const express = require("express");

const router = express.Router();

const {
  getDashboardSummary,
  getDashboardAnalytics,
} = require("../controllers/dashboardController");

const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

// Admin/Manager see organization-wide metrics.
// Agents receive the same shape scoped to their assigned requests.
router.get("/summary", getDashboardSummary);
router.get("/analytics", getDashboardAnalytics);

module.exports = router;
