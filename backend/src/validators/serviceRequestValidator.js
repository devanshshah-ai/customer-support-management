const { z } = require("zod");

const createServiceRequestSchema = z.object({
  customer: z.string().min(1, "Customer is required"),

  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  category: z.enum([
    "Technical Issue",
    "Billing",
    "Account",
    "Product Information",
    "Delivery",
    "Complaint",
  ]),

  severity: z.enum(["Critical", "High", "Medium", "Low"]),

  assignedTeam: z.string().optional().nullable(),

  assignedAgent: z.string().optional().nullable(),

  status: z
    .enum([
      "Open",
      "Under Investigation",
      "Waiting for Customer",
      "Resolved",
      "Closed",
    ])
    .optional(),
});

const updateServiceRequestSchema = z
  .object({
    customer: z.string().min(1).optional(),

    subject: z
      .string()
      .trim()
      .min(3)
      .max(200)
      .optional(),

    description: z
      .string()
      .trim()
      .min(5)
      .optional(),

    category: z
      .enum([
        "Technical Issue",
        "Billing",
        "Account",
        "Product Information",
        "Delivery",
        "Complaint",
      ])
      .optional(),

    severity: z
      .enum(["Critical", "High", "Medium", "Low"])
      .optional(),

    assignedTeam: z.string().optional().nullable(),

    assignedAgent: z.string().optional().nullable(),

    status: z
      .enum([
        "Open",
        "Under Investigation",
        "Waiting for Customer",
        "Resolved",
        "Closed",
      ])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );

module.exports = {
  createServiceRequestSchema,
  updateServiceRequestSchema,
};