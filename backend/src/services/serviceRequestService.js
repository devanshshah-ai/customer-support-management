const mongoose = require("mongoose");

const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");
const User = require("../models/User");
const Team = require("../models/Team");

const {
  createNotification,
} = require("./notificationService");

const {
  createAuditLog,
} = require("./auditLogService");

const {
  calculateSlaDeadline,
} = require("./slaService");

/*
 * Generate unique request number
 */
const generateRequestNumber = async () => {
  const lastRequest = await ServiceRequest.findOne()
    .sort({ createdAt: -1 })
    .select("requestNumber");

  let nextNumber = 1001;

  if (lastRequest?.requestNumber) {
    const lastNumber = parseInt(
      lastRequest.requestNumber.replace("SR-", ""),
      10
    );

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `SR-${nextNumber}`;
};

/*
 * Create Service Request
 */
const createServiceRequest = async (data, createdBy = null) => {
  const customer = await Customer.findById(data.customer);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  /*
   * Validate assigned agent
   */
  if (data.assignedAgent) {
    const agent = await User.findById(data.assignedAgent);

    if (!agent) {
      const error = new Error("Assigned agent not found");
      error.statusCode = 404;
      throw error;
    }

    if (agent.role !== "agent") {
      const error = new Error(
        "Assigned user must have agent role"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  /*
   * Validate assigned team
   */
  if (data.assignedTeam) {
    const team = await Team.findById(data.assignedTeam);

    if (!team) {
      const error = new Error("Assigned team not found");
      error.statusCode = 404;
      throw error;
    }
  }

  const requestNumber = await generateRequestNumber();

  const createdAt = new Date();

  const slaDeadline = calculateSlaDeadline(
    data.severity,
    createdAt
  );

  const request = await ServiceRequest.create({
    ...data,
    requestNumber,
    createdAt,
    slaDeadline,
  });

  /*
   * Audit: Request created
   */
  await createAuditLog({
    user: createdBy,
    action: "CREATE",
    entityType: "ServiceRequest",
    entityId: request._id,
    description:
      `Service request ${request.requestNumber} was created`,
  });

  /*
   * Notify assigned agent
   */
  if (data.assignedAgent) {
    await createNotification({
      recipient: data.assignedAgent,
      type: "REQUEST_ASSIGNED",
      title: "New Service Request Assigned",
      message:
        `Service request ${request.requestNumber} has been assigned to you.`,
      serviceRequest: request._id,
    });
  }

  /*
   * Notify assigned agent about critical request
   */
  if (
    data.severity === "Critical" &&
    data.assignedAgent
  ) {
    await createNotification({
      recipient: data.assignedAgent,
      type: "CRITICAL_REQUEST",
      title: "Critical Service Request",
      message:
        `Critical request ${request.requestNumber} requires immediate attention.`,
      serviceRequest: request._id,
    });
  }

  return ServiceRequest.findById(request._id)
    .populate("customer")
    .populate("assignedTeam")
    .populate("assignedAgent", "-password");
};

/*
 * Get Service Requests
 */
const getServiceRequests = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  severity,
  category,
  assignedTeam,
  assignedAgent,
  startDate,
  endDate,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const pageNumber = Math.max(Number(page) || 1, 1);

  const pageLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (pageNumber - 1) * pageLimit;

  const filter = {};

  /*
   * Search by:
   * - Request number
   * - Subject
   * - Customer name
   * - Customer email
   */
  if (search && search.trim()) {
    const searchRegex = new RegExp(
      search.trim(),
      "i"
    );

    const customers = await Customer.find({
      $or: [
        {
          name: {
            $regex: searchRegex,
          },
        },
        {
          email: {
            $regex: searchRegex,
          },
        },
      ],
    }).select("_id");

    filter.$or = [
      {
        requestNumber: searchRegex,
      },
      {
        subject: searchRegex,
      },
      {
        customer: {
          $in: customers.map(
            (customer) => customer._id
          ),
        },
      },
    ];
  }

  /*
   * Filters
   */
  if (status) {
    filter.status = status;
  }

  if (severity) {
    filter.severity = severity;
  }

  if (category) {
    filter.category = category;
  }

  if (assignedTeam) {
    filter.assignedTeam = assignedTeam;
  }

  if (assignedAgent) {
    filter.assignedAgent = assignedAgent;
  }

  /*
   * Date range filter
   */
  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        const error = new Error(
          "Invalid start date"
        );
        error.statusCode = 400;
        throw error;
      }

      filter.createdAt.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        const error = new Error(
          "Invalid end date"
        );
        error.statusCode = 400;
        throw error;
      }

      end.setHours(23, 59, 59, 999);

      filter.createdAt.$lte = end;
    }
  }

  /*
   * Safe sorting
   */
  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "severity",
    "status",
    "subject",
    "slaDeadline",
  ];

  const safeSortBy =
    allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

  const sort = {
    [safeSortBy]:
      sortOrder === "asc" ? 1 : -1,
  };

  const [requests, total] = await Promise.all([
    ServiceRequest.find(filter)
      .populate("customer")
      .populate("assignedTeam")
      .populate(
        "assignedAgent",
        "-password"
      )
      .sort(sort)
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    ServiceRequest.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(
    total / pageLimit
  );

  return {
    requests,

    pagination: {
      total,
      page: pageNumber,
      limit: pageLimit,
      totalPages,

      hasNextPage:
        pageNumber < totalPages,

      hasPreviousPage:
        pageNumber > 1,
    },
  };
};

/*
 * Get Service Request By ID
 */
const getServiceRequestById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "Invalid service request ID"
    );

    error.statusCode = 400;
    throw error;
  }

  const request = await ServiceRequest.findById(id)
    .populate("customer")
    .populate("assignedTeam")
    .populate(
      "assignedAgent",
      "-password"
    );

  if (!request) {
    const error = new Error(
      "Service request not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return request;
};

/*
 * Update Service Request
 *
 * Handles:
 * - Assignment
 * - Reassignment
 * - Status changes
 * - Severity changes
 * - SLA recalculation
 * - Resolution date
 * - Notifications
 * - Audit logs
 */
const updateServiceRequest = async (
  id,
  data,
  updatedBy = null
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "Invalid service request ID"
    );

    error.statusCode = 400;
    throw error;
  }

  const request =
    await ServiceRequest.findById(id);

  if (!request) {
    const error = new Error(
      "Service request not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
   * Capture previous values BEFORE
   * modifying the document.
   */
  const previousStatus =
    request.status;

  const previousSeverity =
    request.severity;

  const previousAgent =
    request.assignedAgent
      ? request.assignedAgent.toString()
      : null;

  const previousTeam =
    request.assignedTeam
      ? request.assignedTeam.toString()
      : null;

  /*
   * Validate customer
   */
  if (data.customer) {
    const customer =
      await Customer.findById(
        data.customer
      );

    if (!customer) {
      const error = new Error(
        "Customer not found"
      );

      error.statusCode = 404;
      throw error;
    }
  }

  /*
   * Validate assigned agent
   */
  if (data.assignedAgent) {
    const agent =
      await User.findById(
        data.assignedAgent
      );

    if (!agent) {
      const error = new Error(
        "Assigned agent not found"
      );

      error.statusCode = 404;
      throw error;
    }

    if (agent.role !== "agent") {
      const error = new Error(
        "Assigned user must have agent role"
      );

      error.statusCode = 400;
      throw error;
    }
  }

  /*
   * Validate assigned team
   */
  if (data.assignedTeam) {
    const team =
      await Team.findById(
        data.assignedTeam
      );

    if (!team) {
      const error = new Error(
        "Assigned team not found"
      );

      error.statusCode = 404;
      throw error;
    }
  }

  /*
   * Recalculate SLA when severity changes
   */
  if (
    data.severity &&
    data.severity !== request.severity
  ) {
    request.slaDeadline =
      calculateSlaDeadline(
        data.severity,
        request.createdAt
      );
  }

  /*
   * Apply update
   */
  Object.assign(request, data);

  /*
   * Resolution date handling
   */
  if (
    data.status === "Resolved" &&
    previousStatus !== "Resolved"
  ) {
    request.resolutionDate =
      new Date();
  }

  /*
   * If request moves back from
   * Resolved/Closed to an active status,
   * remove resolution date.
   */
  if (
    data.status &&
    data.status !== "Resolved" &&
    data.status !== "Closed"
  ) {
    request.resolutionDate = null;
  }

  await request.save();

  /*
   * Determine new assignment values
   */
  const newAgent =
    request.assignedAgent
      ? request.assignedAgent.toString()
      : null;

  const newTeam =
    request.assignedTeam
      ? request.assignedTeam.toString()
      : null;

  /*
   * Assignment changed
   */
  const agentChanged =
    previousAgent !== newAgent;

  const teamChanged =
    previousTeam !== newTeam;

  if (
    agentChanged ||
    teamChanged
  ) {
    const wasReassigned =
      Boolean(
        previousAgent ||
        previousTeam
      );

    await createAuditLog({
      user: updatedBy,
      action: wasReassigned
        ? "REASSIGN"
        : "ASSIGN",
      entityType: "ServiceRequest",
      entityId: request._id,
      description:
        `Service request ${request.requestNumber} ` +
        `${
          wasReassigned
            ? "was reassigned"
            : "was assigned"
        }`,
    });
  }

  /*
   * Notify new assigned agent
   */
  if (
    agentChanged &&
    newAgent
  ) {
    await createNotification({
      recipient: newAgent,
      type: previousAgent
        ? "REQUEST_REASSIGNED"
        : "REQUEST_ASSIGNED",
      title: previousAgent
        ? "Service Request Reassigned"
        : "New Service Request Assigned",
      message:
        `Service request ${request.requestNumber} ` +
        `${
          previousAgent
            ? "has been reassigned to you."
            : "has been assigned to you."
        }`,
      serviceRequest: request._id,
    });
  }

  /*
   * Status changed
   */
  const statusChanged =
    data.status &&
    previousStatus !== data.status;

  if (statusChanged) {
    await createAuditLog({
      user: updatedBy,
      action: "STATUS_CHANGE",
      entityType: "ServiceRequest",
      entityId: request._id,
      description:
        `Service request ${request.requestNumber} ` +
        `status changed from "${previousStatus}" ` +
        `to "${data.status}"`,
    });

    /*
     * Notify assigned agent
     */
    if (newAgent) {
      await createNotification({
        recipient: newAgent,
        type: "STATUS_CHANGED",
        title: "Request Status Updated",
        message:
          `Request ${request.requestNumber} ` +
          `status changed to "${data.status}".`,
        serviceRequest: request._id,
      });
    }
  }

  /*
   * Severity changed to Critical
   */
  if (
    data.severity === "Critical" &&
    previousSeverity !== "Critical" &&
    newAgent
  ) {
    await createNotification({
      recipient: newAgent,
      type: "CRITICAL_REQUEST",
      title: "Critical Service Request",
      message:
        `Request ${request.requestNumber} ` +
        `has been marked as Critical.`,
      serviceRequest: request._id,
    });

    await createAuditLog({
      user: updatedBy,
      action: "SEVERITY_CHANGE",
      entityType: "ServiceRequest",
      entityId: request._id,
      description:
        `Service request ${request.requestNumber} ` +
        `severity changed from "${previousSeverity}" ` +
        `to "Critical"`,
    });
  }

  /*
   * Return updated request
   */
  return ServiceRequest.findById(
    request._id
  )
    .populate("customer")
    .populate("assignedTeam")
    .populate(
      "assignedAgent",
      "-password"
    );
};

/*
 * Delete Service Request
 */
const deleteServiceRequest = async (
  id,
  deletedBy = null
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "Invalid service request ID"
    );

    error.statusCode = 400;
    throw error;
  }

  const request =
    await ServiceRequest.findById(id);

  if (!request) {
    const error = new Error(
      "Service request not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const requestNumber =
    request.requestNumber;

  await request.deleteOne();

  /*
   * Audit deletion
   */
  await createAuditLog({
    user: deletedBy,
    action: "DELETE",
    entityType: "ServiceRequest",
    entityId: request._id,
    description:
      `Service request ${requestNumber} was deleted`,
  });

  return {
    message:
      "Service request deleted successfully",
  };
};

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
};