const {
  createServiceRequestSchema,
  updateServiceRequestSchema,
} = require("../validators/serviceRequestValidator");

const serviceRequestService = require("../services/serviceRequestService");

/*
 * Create Service Request
 */
const createServiceRequest = async (req, res, next) => {
  try {
    const result =
      createServiceRequestSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: result.error.flatten(),
      });
    }

    const request =
      await serviceRequestService.createServiceRequest(
        result.data,
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message: "Service request created successfully",
      data: {
        request,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Get All Service Requests
 *
 * Supports:
 * - Search
 * - Status filter
 * - Severity filter
 * - Category filter
 * - Team filter
 * - Agent filter
 * - Date range
 * - Server-side pagination
 * - Sorting
 */
const getServiceRequests = async (req, res, next) => {
  try {
    const result =
      await serviceRequestService.getServiceRequests(
        req.query
      );

    return res.status(200).json({
      success: true,
      message: "Service requests fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Get Service Request By ID
 */
const getServiceRequestById = async (req, res, next) => {
  try {
    const request =
      await serviceRequestService.getServiceRequestById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Service request fetched successfully",
      data: {
        request,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Update Service Request
 *
 * Passes the logged-in user ID so that
 * audit logs and notifications can identify
 * who performed the update.
 */
const updateServiceRequest = async (req, res, next) => {
  try {
    const result =
      updateServiceRequestSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: result.error.flatten(),
      });
    }

    const request =
      await serviceRequestService.updateServiceRequest(
        req.params.id,
        result.data,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Service request updated successfully",
      data: {
        request,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Delete Service Request
 *
 * Passes the logged-in user ID so that
 * the deletion can be recorded in AuditLogs.
 */
const deleteServiceRequest = async (req, res, next) => {
  try {
    const result =
      await serviceRequestService.deleteServiceRequest(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
};