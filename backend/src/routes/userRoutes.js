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

router.use(authenticate);

// Managers can read the agent directory for assignment/workload screens.
router.get("/", authorize(ROLES.ADMIN, ROLES.MANAGER), getAll);
router.get("/:id", authorize(ROLES.ADMIN, ROLES.MANAGER), getOne);

// User administration remains Admin-only.
router.post("/", authorize(ROLES.ADMIN), create);
router.put("/:id", authorize(ROLES.ADMIN), update);
router.patch("/:id/status", authorize(ROLES.ADMIN), updateStatus);
router.delete("/:id", authorize(ROLES.ADMIN), remove);

module.exports = router;
