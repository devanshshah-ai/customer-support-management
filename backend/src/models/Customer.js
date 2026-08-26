const mongoose = require("mongoose");

const CUSTOMER_TYPES = [
  "individual",
  "business",
  "enterprise",
];

const ACCOUNT_STATUSES = [
  "active",
  "inactive",
  "suspended",
];

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must be at least 2 characters"],
      maxlength: [150, "Customer name cannot exceed 150 characters"],
    },

    email: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
    },

    phone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
      maxlength: [30, "Phone number cannot exceed 30 characters"],
    },

    company: {
      type: String,
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: [150, "Location cannot exceed 150 characters"],
      default: "",
    },

    customerType: {
      type: String,
      required: [true, "Customer type is required"],
      enum: {
        values: CUSTOMER_TYPES,
        message: "Invalid customer type",
      },
      index: true,
    },

    accountStatus: {
      type: String,
      enum: {
        values: ACCOUNT_STATUSES,
        message: "Invalid account status",
      },
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common searches and sorting
customerSchema.index({ name: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ company: 1 });
customerSchema.index({ createdAt: -1 });

// Compound index for filtering + sorting
customerSchema.index({
  accountStatus: 1,
  customerType: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Customer", customerSchema);