const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "ASSIGN",
        "REASSIGN",
        "STATUS_CHANGE",
        "MESSAGE_ADDED",
        "NOTE_ADDED",
        "READ",
        "OTHER",
        "SEVERITY_CHANGE",
      ],
      required: true,
      index: true,
    },

    entityType: {
      type: String,
      enum: [
        "User",
        "Team",
        "Customer",
        "ServiceRequest",
        "Message",
        "Notification",
        "Other",
      ],
      required: true,
      index: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },

    userAgent: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for user activity history
auditLogSchema.index({
  user: 1,
  createdAt: -1,
});

// Useful for entity history
auditLogSchema.index({
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});

// Useful for action-based reporting
auditLogSchema.index({
  action: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "AuditLog",
  auditLogSchema
);