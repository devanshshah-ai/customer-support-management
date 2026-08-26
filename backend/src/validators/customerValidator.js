const { z } = require("zod");

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

const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(150, "Customer name cannot exceed 150 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .max(254, "Email cannot exceed 254 characters"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(30, "Phone number cannot exceed 30 characters"),

  company: z
    .string()
    .trim()
    .max(150, "Company name cannot exceed 150 characters")
    .optional()
    .default(""),

  location: z
    .string()
    .trim()
    .max(150, "Location cannot exceed 150 characters")
    .optional()
    .default(""),

  customerType: z.enum(CUSTOMER_TYPES),

  accountStatus: z
    .enum(ACCOUNT_STATUSES)
    .optional()
    .default("active"),
});

const updateCustomerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Customer name must be at least 2 characters")
      .max(150, "Customer name cannot exceed 150 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Please provide a valid email")
      .max(254, "Email cannot exceed 254 characters")
      .optional(),

    phone: z
      .string()
      .trim()
      .min(7, "Phone number must be at least 7 characters")
      .max(30, "Phone number cannot exceed 30 characters")
      .optional(),

    company: z
      .string()
      .trim()
      .max(150, "Company name cannot exceed 150 characters")
      .optional(),

    location: z
      .string()
      .trim()
      .max(150, "Location cannot exceed 150 characters")
      .optional(),

    customerType: z
      .enum(CUSTOMER_TYPES)
      .optional(),

    accountStatus: z
      .enum(ACCOUNT_STATUSES)
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};