const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../services/customerService");

const {
  createCustomerSchema,
  updateCustomerSchema,
} = require("../validators/customerValidator");

const create = async (req, res, next) => {
  try {
    const validationResult =
      createCustomerSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");

      error.statusCode = 400;

      error.details =
        validationResult.error.flatten();

      throw error;
    }

    const customer = await createCustomer(
      validationResult.data
    );

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        customer,
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
      customerType,
      accountStatus,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await getCustomers({
      page,
      limit,
      search,
      customerType,
      accountStatus,
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      message: "Customers retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const result = await getCustomerById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Customer details fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const validationResult =
      updateCustomerSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");

      error.statusCode = 400;

      error.details =
        validationResult.error.flatten();

      throw error;
    }

    const customer = await updateCustomer(
      req.params.id,
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteCustomer(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
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
  remove,
};