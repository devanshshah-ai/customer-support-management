const { ROLES } = require("../constants/auth");

const getRequestScope = (actor) => {
  if (actor?.role === ROLES.AGENT) {
    return {
      assignedAgent: actor.userId,
    };
  }

  return {};
};

const assertRequestAccess = (request, actor) => {
  if (!request) {
    return;
  }

  if (actor?.role !== ROLES.AGENT) {
    return;
  }

  const assignedAgentId = request.assignedAgent?._id
    ? request.assignedAgent._id.toString()
    : request.assignedAgent?.toString();

  if (!assignedAgentId || assignedAgentId !== actor.userId) {
    const error = new Error(
      "You are not authorized to access this service request"
    );
    error.statusCode = 403;
    throw error;
  }
};

const assertAgentUpdateFields = (updates, actor) => {
  if (actor?.role !== ROLES.AGENT) {
    return;
  }

  const allowedFields = new Set(["status", "resolutionNote"]);
  const forbiddenFields = Object.keys(updates).filter(
    (field) => !allowedFields.has(field)
  );

  if (forbiddenFields.length > 0) {
    const error = new Error(
      "Support agents can only update the request status and resolution note"
    );
    error.statusCode = 403;
    throw error;
  }
};

module.exports = {
  getRequestScope,
  assertRequestAccess,
  assertAgentUpdateFields,
};
