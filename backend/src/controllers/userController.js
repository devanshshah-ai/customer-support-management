const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
} = require("../services/userService");

const {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} = require("../validators/userValidator");

const create = async (req, res, next) => {
  try {
    const validationResult = createUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const user = await createUser(validationResult.data);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      search,
      role,
      isActive,
      sortBy,
      sortOrder,
    } = req.query;

    let parsedIsActive;

    if (isActive !== undefined) {
      if (isActive === "true") {
        parsedIsActive = true;
      } else if (isActive === "false") {
        parsedIsActive = false;
      } else {
        const error = new Error("isActive must be true or false");
        error.statusCode = 400;
        throw error;
      }
    }

    const result = await getUsers({
      page,
      limit,
      search,
      role,
      isActive: parsedIsActive,
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const user = await updateUser(
      req.params.id,
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const validationResult =
      updateUserStatusSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const user = await updateUserStatus(
      req.params.id,
      validationResult.data.isActive
    );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteUser(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  remove,
};