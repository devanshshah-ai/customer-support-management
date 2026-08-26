const { z } = require("zod");

const { ROLES } = require("../constants/auth");

const roleValues = Object.values(ROLES);

const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot exceed 16 characters"),

  role: z.enum(roleValues),

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Please provide a valid email")
      .optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password cannot exceed 16 characters")
      .optional(),

    role: z
      .enum(roleValues)
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
};