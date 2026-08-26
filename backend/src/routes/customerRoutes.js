const express = require("express");

const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require("../controllers/customerController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const { ROLES } = require("../constants/auth");

const router = express.Router();

// All customer routes require authentication
router.use(authenticate);

/*
 * Customer management:
 *
 * Admin:
 *   Full access
 *
 * Manager:
 *   Full customer access
 *
 * Agent:
 *   Can view/create/update customers
 *
 * Delete remains Admin-only.
 */

router.post(
  "/",
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AGENT
  ),
  create
);

router.get(
  "/",
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AGENT
  ),
  getAll
);

router.get(
  "/:id",
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AGENT
  ),
  getOne
);

router.put(
  "/:id",
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AGENT
  ),
  update
);

router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  remove
);

module.exports = router;