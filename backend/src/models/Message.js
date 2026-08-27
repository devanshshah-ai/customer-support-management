const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },

    type: {
      type: String,
      enum: ["customer", "internal"],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Efficient conversation-history queries
messageSchema.index({
  request: 1,
  createdAt: 1,
});

module.exports = mongoose.model("Message", messageSchema);