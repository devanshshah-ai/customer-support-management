const mongoose = require("mongoose");

const Message = require("../models/Message");
const ServiceRequest = require("../models/ServiceRequest");

const createMessage = async ({
  requestId,
  authorId,
  message,
  type,
}) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    const error = new Error("Invalid service request ID");
    error.statusCode = 400;
    throw error;
  }

  const request = await ServiceRequest.findById(requestId);

  if (!request) {
    const error = new Error("Service request not found");
    error.statusCode = 404;
    throw error;
  }

  const newMessage = await Message.create({
    request: requestId,
    author: authorId,
    message,
    type,
  });

  return Message.findById(newMessage._id)
    .populate("author", "-password")
    .populate({
      path: "request",
      populate: {
        path: "customer",
      },
    });
};

const getMessagesByRequest = async ({
  requestId,
  page = 1,
  limit = 20,
}) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    const error = new Error("Invalid service request ID");
    error.statusCode = 400;
    throw error;
  }

  const request = await ServiceRequest.findById(requestId);

  if (!request) {
    const error = new Error("Service request not found");
    error.statusCode = 404;
    throw error;
  }

  const pageNumber = Math.max(Number(page) || 1, 1);

  const pageLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip = (pageNumber - 1) * pageLimit;

  const [messages, total] = await Promise.all([
    Message.find({
      request: requestId,
    })
      .populate("author", "-password")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    Message.countDocuments({
      request: requestId,
    }),
  ]);

  return {
    messages,

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

module.exports = {
  createMessage,
  getMessagesByRequest,
};