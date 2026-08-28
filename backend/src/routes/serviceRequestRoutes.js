const express = require("express");

const router = express.Router();

const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
} = require("../controllers/serviceRequestController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");
const { ROLES } = require("../constants/auth");

router.use(authenticate);

// All authenticated support users can create/view requests.
// Agent scoping is enforced in the service layer.
router.post("/", createServiceRequest);
router.get("/", getServiceRequests);
router.get("/:id", getServiceRequestById);
router.put("/:id", updateServiceRequest);

// Destructive deletion is intentionally Admin-only.
router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  deleteServiceRequest
);

module.exports = router;
