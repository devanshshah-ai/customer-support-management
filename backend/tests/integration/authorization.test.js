const request = require("supertest");

const User = require("../../src/models/User");
const Team = require("../../src/models/Team");
const {
  app,
  connectTestDatabase,
  createTestUser,
  loginTestUser,
  closeTestDatabase,
} = require("../helpers/testHelpers");

describe("Role-based authorization", () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const password = "Test@12345";

  let admin;
  let manager;
  let agent;
  let adminToken;
  let managerToken;
  let agentToken;
  const teamIds = [];

  beforeAll(async () => {
    await connectTestDatabase();

    ({ user: admin } = await createTestUser({
      name: "RBAC Admin",
      email: `rbac-admin-${suffix}@example.com`,
      password,
      role: "admin",
    }));
    ({ user: manager } = await createTestUser({
      name: "RBAC Manager",
      email: `rbac-manager-${suffix}@example.com`,
      password,
      role: "manager",
    }));
    ({ user: agent } = await createTestUser({
      name: "RBAC Agent",
      email: `rbac-agent-${suffix}@example.com`,
      password,
      role: "agent",
    }));

    [adminToken, managerToken, agentToken] = await Promise.all([
      loginTestUser(admin.email, password),
      loginTestUser(manager.email, password),
      loginTestUser(agent.email, password),
    ]);
  });

  afterAll(async () => {
    await Team.deleteMany({ _id: { $in: teamIds } });
    await User.deleteMany({ _id: { $in: [admin._id, manager._id, agent._id] } });
    await closeTestDatabase();
  });

  test("rejects protected APIs without a token", async () => {
    const response = await request(app).get("/api/users");
    expect(response.statusCode).toBe(401);
  });

  test("manager can read user directory but agent cannot", async () => {
    const managerResponse = await request(app)
      .get("/api/users?role=agent")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(managerResponse.statusCode).toBe(200);

    const agentResponse = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(agentResponse.statusCode).toBe(403);
  });

  test("only admin can create users", async () => {
    const payload = {
      name: "Created Through RBAC Test",
      email: `created-user-${suffix}@example.com`,
      password,
      role: "agent",
      isActive: true,
    };

    const managerResponse = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${managerToken}`)
      .send(payload);
    expect(managerResponse.statusCode).toBe(403);

    const adminResponse = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload);
    expect(adminResponse.statusCode).toBe(201);

    await User.deleteOne({ email: payload.email });
  });

  test("manager can read teams but cannot modify team definitions", async () => {
    const team = await Team.create({
      name: `RBAC Team ${suffix}`,
      description: "Authorization test team",
    });
    teamIds.push(team._id);

    const listResponse = await request(app)
      .get("/api/teams")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(listResponse.statusCode).toBe(200);

    const updateResponse = await request(app)
      .put(`/api/teams/${team._id}`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ name: `Changed ${suffix}` });
    expect(updateResponse.statusCode).toBe(403);
  });

  test("admin can manage teams", async () => {
    const response = await request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Admin Team ${suffix}`,
        description: "Created by admin",
      });

    expect(response.statusCode).toBe(201);
    teamIds.push(response.body.data.team.id || response.body.data.team._id);
  });

  test("agent can access a dashboard scoped to assigned work", async () => {
    const response = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${agentToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
