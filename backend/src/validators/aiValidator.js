const { z } = require("zod");

const analyzeIssueSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(10000, "Description cannot exceed 10000 characters"),
});

module.exports = {
  analyzeIssueSchema,
};
