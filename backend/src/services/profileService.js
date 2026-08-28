const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { createAuditLog } = require("./auditLogService");

const sanitizeProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeProfile(user);
};

const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (updates.email !== undefined) {
    const normalizedEmail = updates.email.trim().toLowerCase();
    const duplicate = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (duplicate) {
      const error = new Error("User with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    user.email = normalizedEmail;
  }

  if (updates.name !== undefined) {
    user.name = updates.name.trim();
  }

  await user.save();

  await createAuditLog({
    user: userId,
    action: "UPDATE",
    entityType: "User",
    entityId: userId,
    description: "User updated their profile",
  });

  return sanitizeProfile(user);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const currentPasswordMatches = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!currentPasswordMatches) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  const samePassword = await bcrypt.compare(newPassword, user.password);
  if (samePassword) {
    const error = new Error(
      "New password must be different from the current password"
    );
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  await createAuditLog({
    user: userId,
    action: "UPDATE",
    entityType: "User",
    entityId: userId,
    description: "User changed their password",
  });
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
