const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Technical Issue",
        "Billing",
        "Account",
        "Product Information",
        "Delivery",
        "Complaint",
      ],
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
      index: true,
    },

    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
      index: true,
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "Open",
        "Under Investigation",
        "Waiting for Customer",
        "Resolved",
        "Closed",
      ],
      default: "Open",
      index: true,
    },

    resolutionDate: {
      type: Date,
      default: null,
    },

    resolutionNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    slaDeadline: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for filtering/sorting requests efficiently
serviceRequestSchema.index({
  status: 1,
  severity: 1,
  createdAt: -1,
});

serviceRequestSchema.index({
  assignedTeam: 1,
  status: 1,
});

serviceRequestSchema.index({
  assignedAgent: 1,
  status: 1,
});

serviceRequestSchema.index({
  customer: 1,
  createdAt: -1,
});

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

module.exports = ServiceRequest;