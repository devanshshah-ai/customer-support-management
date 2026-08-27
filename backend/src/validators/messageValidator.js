const { z } = require("zod");

const createMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),

  type: z.enum(["customer", "internal"]),
});

module.exports = {
  createMessageSchema,
};