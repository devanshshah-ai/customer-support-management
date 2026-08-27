const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  user = null,
  action,
  entityType,
  entityId = null,
  description,
  req = null,
}) => {
  try {
    const auditLog = await AuditLog.create({
      user,
      action,
      entityType,
      entityId,
      description,
      ipAddress: req
        ? req.ip || null
        : null,
      userAgent: req
        ? req.get("user-agent") || null
        : null,
    });

    return auditLog;
  } catch (error) {
    /*
     * Audit logging should not break the
     * main business operation.
     */
    console.error(
      "Audit log creation failed:",
      error
    );

    return null;
  }
};

const getAuditLogs = async ({
  page = 1,
  limit = 20,
  user,
  action,
  entityType,
  entityId,
}) => {
  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const pageLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip = (currentPage - 1) * pageLimit;

  const query = {};

  if (user) {
    query.user = user;
  }

  if (action) {
    query.action = action;
  }

  if (entityType) {
    query.entityType = entityType;
  }

  if (entityId) {
    query.entityId = entityId;
  }

  const [
    auditLogs,
    totalLogs,
  ] = await Promise.all([
    AuditLog.find(query)
      .populate(
        "user",
        "name email role"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    AuditLog.countDocuments(query),
  ]);

  const totalPages = Math.ceil(
    totalLogs / pageLimit
  );

  return {
    auditLogs,

    pagination: {
      currentPage,
      pageLimit,
      totalLogs,
      totalPages,
      hasNextPage:
        currentPage < totalPages,
      hasPreviousPage:
        currentPage > 1,
    },
  };
};

module.exports = {
  createAuditLog,
  getAuditLogs,
};