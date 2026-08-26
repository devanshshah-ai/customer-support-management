const mongoose = require("mongoose");
const Customer = require("../models/Customer");

const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

const sanitizeCustomer = (customer) => ({
  id: customer._id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  company: customer.company,
  location: customer.location,
  customerType: customer.customerType,
  accountStatus: customer.accountStatus,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

const createCustomer = async (customerData) => {
  const normalizedEmail = customerData.email
    .trim()
    .toLowerCase();

  const existingCustomer = await Customer.findOne({
    email: normalizedEmail,
  });

  if (existingCustomer) {
    const error = new Error(
      "A customer with this email already exists"
    );
    error.statusCode = 409;
    throw error;
  }

  const customer = await Customer.create({
    ...customerData,
    email: normalizedEmail,
  });

  return sanitizeCustomer(customer);
};

const getCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
  customerType,
  accountStatus,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);

  const pageLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * pageLimit;

  const query = {};

  // Search by name, email, company or phone
  if (search && search.trim()) {
    const searchValue = search.trim();

    query.$or = [
      {
        name: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        email: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        company: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  if (customerType) {
    query.customerType = customerType;
  }

  if (accountStatus) {
    query.accountStatus = accountStatus;
  }

  const allowedSortFields = [
    "name",
    "email",
    "company",
    "customerType",
    "accountStatus",
    "createdAt",
    "updatedAt",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const safeSortOrder = sortOrder === "asc" ? 1 : -1;

  const [customers, totalCustomers] = await Promise.all([
    Customer.find(query)
      .sort({
        [safeSortBy]: safeSortOrder,
      })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    Customer.countDocuments(query),
  ]);

  const totalPages = Math.ceil(
    totalCustomers / pageLimit
  );

  return {
    customers: customers.map(sanitizeCustomer),

    pagination: {
      currentPage,
      pageLimit,
      totalCustomers,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getCustomerById = async (customerId) => {
  validateObjectId(customerId, "customer ID");

  const customer = await Customer.findById(
    customerId
  ).lean();

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeCustomer(customer);
};

const updateCustomer = async (
  customerId,
  customerData
) => {
  validateObjectId(customerId, "customer ID");

  const customer = await Customer.findById(customerId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  if (customerData.email !== undefined) {
    const normalizedEmail = customerData.email
      .trim()
      .toLowerCase();

    const duplicateCustomer =
      await Customer.findOne({
        email: normalizedEmail,
        _id: {
          $ne: customerId,
        },
      });

    if (duplicateCustomer) {
      const error = new Error(
        "A customer with this email already exists"
      );
      error.statusCode = 409;
      throw error;
    }

    customer.email = normalizedEmail;
  }

  if (customerData.name !== undefined) {
    customer.name = customerData.name.trim();
  }

  if (customerData.phone !== undefined) {
    customer.phone = customerData.phone.trim();
  }

  if (customerData.company !== undefined) {
    customer.company = customerData.company.trim();
  }

  if (customerData.location !== undefined) {
    customer.location = customerData.location.trim();
  }

  if (customerData.customerType !== undefined) {
    customer.customerType =
      customerData.customerType;
  }

  if (customerData.accountStatus !== undefined) {
    customer.accountStatus =
      customerData.accountStatus;
  }

  await customer.save();

  return sanitizeCustomer(customer);
};

const deleteCustomer = async (customerId) => {
  validateObjectId(customerId, "customer ID");

  const customer = await Customer.findById(
    customerId
  );

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  /*
   * Later, once ServiceRequests exist, we should
   * prevent deleting a customer that has service
   * history or use a soft-delete strategy.
   */

  await Customer.findByIdAndDelete(customerId);

  return {
    id: customer._id,
  };
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};