const {
  getAuditLogs,
} = require("../services/auditLogService");

const getLogs = async (
  req,
  res,
  next
) => {
  try {
    const {
      page,
      limit,
      user,
      action,
      entityType,
      entityId,
    } = req.query;

    const result = await getAuditLogs({
      page,
      limit,
      user,
      action,
      entityType,
      entityId,
    });

    return res.status(200).json({
      success: true,
      message:
        "Audit logs retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLogs,
};