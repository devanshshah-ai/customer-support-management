const {
  createServiceRequestSchema,
  updateServiceRequestSchema,
} = require("../validators/serviceRequestValidator");

const serviceRequestService = require("../services/serviceRequestService");

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
        result.data
      );

    res.status(201).json({
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

const getServiceRequests = async (req, res, next) => {
  try {
    const result =
      await serviceRequestService.getServiceRequests(
        req.query
      );

    res.status(200).json({
      success: true,
      message: "Service requests fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getServiceRequestById = async (req, res, next) => {
  try {
    const request =
      await serviceRequestService.getServiceRequestById(
        req.params.id
      );

    res.status(200).json({
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
        result.data
      );

    res.status(200).json({
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

const deleteServiceRequest = async (req, res, next) => {
  try {
    const result =
      await serviceRequestService.deleteServiceRequest(
        req.params.id
      );

    res.status(200).json({
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