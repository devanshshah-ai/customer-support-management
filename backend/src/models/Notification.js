const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "REQUEST_ASSIGNED",
        "REQUEST_REASSIGNED",
        "CRITICAL_REQUEST",
        "SLA_APPROACHING",
        "SLA_BREACHED",
        "STATUS_CHANGED",
        "GENERAL",
      ],
      default: "GENERAL",
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      default: null,
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for fetching unread notifications quickly
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

// Useful for request-specific notification history
notificationSchema.index({
  serviceRequest: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);