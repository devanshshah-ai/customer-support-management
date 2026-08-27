const express = require("express");

const router = express.Router();

const {
  getDashboardSummary,
  getDashboardAnalytics,
} = require("../controllers/dashboardController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

router.use(authenticate);

// Dashboard is intended for management roles.
router.get(
  "/summary",
  authorize("admin", "manager"),
  getDashboardSummary
);

router.get(
  "/analytics",
  authorize("admin", "manager"),
  getDashboardAnalytics
);

module.exports = router;