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

// All team routes require authentication
router.use(authenticate);

// Team management is currently Admin-only
router.use(authorize(ROLES.ADMIN));

// Team CRUD
router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", update);
router.patch("/:id/status", updateStatus);
router.delete("/:id", remove);

// Team membership
router.post("/:id/members", addTeamMember);
router.delete(
  "/:id/members/:userId",
  removeTeamMember
);

module.exports = router;