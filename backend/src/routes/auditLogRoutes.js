const express = require("express");

const router = express.Router();

const {
  getLogs,
} = require("../controllers/auditLogController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

router.use(authenticate);

router.get(
  "/",
  authorize("admin"),
  getLogs
);

module.exports = router;