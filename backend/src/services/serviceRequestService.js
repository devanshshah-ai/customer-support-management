const mongoose = require("mongoose");
const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");
const User = require("../models/User");
const Team = require("../models/Team");

const {
  calculateSlaDeadline,
} = require("./slaService");

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

const createServiceRequest = async (data) => {
  const customer = await Customer.findById(data.customer);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

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

  return ServiceRequest.findById(request._id)
    .populate("customer")
    .populate("assignedTeam")
    .populate("assignedAgent", "-password");
};

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

  if (search) {
    const searchRegex = new RegExp(search, "i");

    const customers = await Customer.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    }).select("_id");

    filter.$or = [
      { requestNumber: searchRegex },
      { subject: searchRegex },
      {
        customer: {
          $in: customers.map(
            (customer) => customer._id
          ),
        },
      },
    ];
  }

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

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.createdAt.$lte = end;
    }
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "severity",
    "status",
    "subject",
    "slaDeadline",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const sort = {
    [safeSortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [requests, total] = await Promise.all([
    ServiceRequest.find(filter)
      .populate("customer")
      .populate("assignedTeam")
      .populate("assignedAgent", "-password")
      .sort(sort)
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    ServiceRequest.countDocuments(filter),
  ]);

  return {
    requests,
    pagination: {
      total,
      page: pageNumber,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
      hasNextPage:
        pageNumber < Math.ceil(total / pageLimit),
      hasPreviousPage: pageNumber > 1,
    },
  };
};

const getServiceRequestById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid service request ID");
    error.statusCode = 400;
    throw error;
  }

  const request = await ServiceRequest.findById(id)
    .populate("customer")
    .populate("assignedTeam")
    .populate("assignedAgent", "-password");

  if (!request) {
    const error = new Error("Service request not found");
    error.statusCode = 404;
    throw error;
  }

  return request;
};

const updateServiceRequest = async (id, data) => {
  const request = await ServiceRequest.findById(id);

  if (!request) {
    const error = new Error("Service request not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.customer) {
    const customer = await Customer.findById(data.customer);

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }
  }

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

  if (data.assignedTeam) {
    const team = await Team.findById(data.assignedTeam);

    if (!team) {
      const error = new Error("Assigned team not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.severity && data.severity !== request.severity) {
    request.slaDeadline = calculateSlaDeadline(
      data.severity,
      request.createdAt
    );
  }

  Object.assign(request, data);

  if (
    data.status === "Resolved" &&
    request.status !== "Resolved"
  ) {
    request.resolutionDate = new Date();
  }

  if (
    data.status &&
    data.status !== "Resolved" &&
    data.status !== "Closed"
  ) {
    request.resolutionDate = null;
  }

  await request.save();

  return ServiceRequest.findById(request._id)
    .populate("customer")
    .populate("assignedTeam")
    .populate("assignedAgent", "-password");
};

const deleteServiceRequest = async (id) => {
  const request = await ServiceRequest.findById(id);

  if (!request) {
    const error = new Error("Service request not found");
    error.statusCode = 404;
    throw error;
  }

  await request.deleteOne();

  return {
    message: "Service request deleted successfully",
  };
};

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
};