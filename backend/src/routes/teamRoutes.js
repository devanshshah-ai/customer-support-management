const express = require("express");

const {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  remove,
  addTeamMember,
  removeTeamMember,
} = require("../controllers/teamController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const { ROLES } = require("../constants/auth");

const router = express.Router();

router.use(authenticate);

// Admin and Manager can view teams for workload/assignment workflows.
router.get("/", authorize(ROLES.ADMIN, ROLES.MANAGER), getAll);
router.get("/:id", authorize(ROLES.ADMIN, ROLES.MANAGER), getOne);

// Team definition and membership changes remain Admin-only.
router.post("/", authorize(ROLES.ADMIN), create);
router.put("/:id", authorize(ROLES.ADMIN), update);
router.patch("/:id/status", authorize(ROLES.ADMIN), updateStatus);
router.delete("/:id", authorize(ROLES.ADMIN), remove);
router.post("/:id/members", authorize(ROLES.ADMIN), addTeamMember);
router.delete(
  "/:id/members/:userId",
  authorize(ROLES.ADMIN),
  removeTeamMember
);

module.exports = router;
