const ROLES = Object.freeze({
  ADMIN: "admin",
  MANAGER: "manager",
  AGENT: "agent",
});

const JWT_EXPIRES_IN = "1d";

module.exports = {
  ROLES,
  JWT_EXPIRES_IN,
};