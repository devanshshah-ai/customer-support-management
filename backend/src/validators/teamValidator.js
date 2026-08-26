const { z } = require("zod");

const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Team name must be at least 2 characters")
    .max(100, "Team name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default(""),

  members: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Invalid member ID")
    )
    .optional()
    .default([]),

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

const updateTeamSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Team name must be at least 2 characters")
      .max(100, "Team name cannot exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
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

const updateTeamStatusSchema = z.object({
  isActive: z.boolean(),
});

const addTeamMemberSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, "User ID is required"),
});

module.exports = {
  createTeamSchema,
  updateTeamSchema,
  updateTeamStatusSchema,
  addTeamMemberSchema,
};