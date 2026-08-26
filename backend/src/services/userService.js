const bcrypt = require("bcryptjs");

const User = require("../models/User");

const sanitizeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const createUser = async ({
  name,
  email,
  password,
  role,
  isActive = true,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    isActive,
  });

  return sanitizeUser(user);
};

const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
  isActive,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const currentPage = Math.max(Number(page), 1);
  const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (currentPage - 1) * pageLimit;

  const query = {};

  if (search.trim()) {
    query.$or = [
      {
        name: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        email: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (typeof isActive === "boolean") {
    query.isActive = isActive;
  }

  const allowedSortFields = [
    "name",
    "email",
    "role",
    "createdAt",
    "updatedAt",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const safeSortOrder = sortOrder === "asc" ? 1 : -1;

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .sort({
        [safeSortBy]: safeSortOrder,
      })
      .skip(skip)
      .limit(pageLimit),

    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalUsers / pageLimit);

  return {
    users: users.map(sanitizeUser),
    pagination: {
      currentPage,
      pageLimit,
      totalUsers,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

const updateUser = async (userId, updates) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (updates.email) {
    const normalizedEmail = updates.email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (existingUser) {
      const error = new Error("User with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    user.email = normalizedEmail;
  }

  if (updates.name !== undefined) {
    user.name = updates.name.trim();
  }

  if (updates.password !== undefined) {
    user.password = await bcrypt.hash(updates.password, 12);
  }

  if (updates.role !== undefined) {
    user.role = updates.role;
  }

  if (updates.isActive !== undefined) {
    user.isActive = updates.isActive;
  }

  await user.save();

  return sanitizeUser(user);
};

const updateUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.isActive = isActive;

  await user.save();

  return sanitizeUser(user);
};

const deleteUser = async (userId, requestingUserId) => {
  if (userId === requestingUserId) {
    const error = new Error("You cannot delete your own account");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await User.findByIdAndDelete(userId);

  return {
    id: user._id,
  };
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};