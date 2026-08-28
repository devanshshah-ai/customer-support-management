const request = require("supertest");

const User = require("../../src/models/User");
const Customer = require("../../src/models/Customer");
const ServiceRequest = require("../../src/models/ServiceRequest");
const Notification = require("../../src/models/Notification");
const AuditLog = require("../../src/models/AuditLog");
const {
  app,
  connectTestDatabase,
  createTestUser,
  loginTestUser,
  closeTestDatabase,
} = require("../helpers/testHelpers");

describe("Service Request API", () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const password = "Test@12345";

  let admin;
  let manager;
  let agentOne;
  let agentTwo;
  let adminToken;
  let managerToken;
  let agentOneToken;
  let customer;
  const requestIds = [];

  beforeAll(async () => {
    await connectTestDatabase();

    ({ user: admin } = await createTestUser({
      name: "Request Admin",
      email: `request-admin-${suffix}@example.com`,
      password,
      role: "admin",
    }));
    ({ user: manager } = await createTestUser({
      name: "Request Manager",
      email: `request-manager-${suffix}@example.com`,
      password,
      role: "manager",
    }));
    ({ user: agentOne } = await createTestUser({
      name: "Request Agent One",
      email: `request-agent-one-${suffix}@example.com`,
      password,
      role: "agent",
    }));
    ({ user: agentTwo } = await createTestUser({
      name: "Request Agent Two",
      email: `request-agent-two-${suffix}@example.com`,
      password,
      role: "agent",
    }));

    [adminToken, managerToken, agentOneToken] = await Promise.all([
      loginTestUser(admin.email, password),
      loginTestUser(manager.email, password),
      loginTestUser(agentOne.email, password),
    ]);

    customer = await Customer.create({
      name: "Request Test Customer",
      email: `request-customer-${suffix}@example.com`,
      phone: "+1-555-0200",
      company: "Request Test Co",
      location: "Chicago, IL",
      customerType: "business",
      accountStatus: "active",
    });
  });

  afterAll(async () => {
    await Notification.deleteMany({
      $or: [
        { recipient: { $in: [agentOne._id, agentTwo._id] } },
        { serviceRequest: { $in: requestIds } },
      ],
    });
    await AuditLog.deleteMany({ entityId: { $in: requestIds } });
    await ServiceRequest.deleteMany({ _id: { $in: requestIds } });
    await Customer.deleteOne({ _id: customer._id });
    await User.deleteMany({
      _id: { $in: [admin._id, manager._id, agentOne._id, agentTwo._id] },
    });
    await closeTestDatabase();
  });

  test("manager creates a request assigned to an agent with calculated SLA", async () => {
    const response = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        customer: customer._id.toString(),
        subject: `Billing access ${suffix}`,
        description: "Customer cannot access the paid billing feature.",
        category: "Billing",
        severity: "High",
        assignedAgent: agentOne._id.toString(),
        status: "Open",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.request.requestNumber).toMatch(/^SR-/);
    expect(response.body.data.request.slaDeadline).toBeTruthy();
    expect(response.body.data.request.slaStatus).toBeTruthy();
    expect(String(response.body.data.request.assignedAgent._id)).toBe(
      agentOne._id.toString()
    );

    requestIds.push(response.body.data.request._id);
  });

  test("agent-created request is automatically assigned to that agent", async () => {
    const response = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${agentOneToken}`)
      .send({
        customer: customer._id.toString(),
        subject: `Agent created ${suffix}`,
        description: "A support request created by the assigned support agent.",
        category: "Technical Issue",
        severity: "Medium",
        assignedAgent: agentTwo._id.toString(),
        status: "Open",
      });

    expect(response.statusCode).toBe(201);
    expect(String(response.body.data.request.assignedAgent._id)).toBe(
      agentOne._id.toString()
    );
    expect(response.body.data.request.assignedTeam).toBeNull();

    requestIds.push(response.body.data.request._id);
  });

  test("agent list is scoped to requests assigned to that agent", async () => {
    const otherRequest = await ServiceRequest.create({
      requestNumber: `SR-OTHER-${suffix}`,
      customer: customer._id,
      subject: `Other agent request ${suffix}`,
      description: "This request belongs to a different agent.",
      category: "Account",
      severity: "Low",
      assignedAgent: agentTwo._id,
      status: "Open",
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
    requestIds.push(otherRequest._id);

    const response = await request(app)
      .get(`/api/requests?search=${encodeURIComponent(suffix)}&limit=100`)
      .set("Authorization", `Bearer ${agentOneToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.requests.length).toBeGreaterThan(0);
    response.body.data.requests.forEach((serviceRequest) => {
      expect(String(serviceRequest.assignedAgent._id)).toBe(
        agentOne._id.toString()
      );
    });
  });

  test("agent cannot open a request assigned to another agent", async () => {
    const otherRequest = await ServiceRequest.create({
      requestNumber: `SR-PRIVATE-${suffix}`,
      customer: customer._id,
      subject: "Private assignment",
      description: "Only the assigned agent should access this request.",
      category: "Complaint",
      severity: "Medium",
      assignedAgent: agentTwo._id,
      status: "Under Investigation",
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    requestIds.push(otherRequest._id);

    const response = await request(app)
      .get(`/api/requests/${otherRequest._id}`)
      .set("Authorization", `Bearer ${agentOneToken}`);

    expect(response.statusCode).toBe(403);
  });

  test("agent can update status but cannot edit request content or assignment", async () => {
    const ownedRequest = await ServiceRequest.create({
      requestNumber: `SR-OWNED-${suffix}`,
      customer: customer._id,
      subject: "Owned request",
      description: "Request used to verify agent update permissions.",
      category: "Technical Issue",
      severity: "Medium",
      assignedAgent: agentOne._id,
      status: "Open",
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    requestIds.push(ownedRequest._id);

    const resolutionNote =
      "Restarted the affected service, verified access, and confirmed the resolution.";

    const statusResponse = await request(app)
      .put(`/api/requests/${ownedRequest._id}`)
      .set("Authorization", `Bearer ${agentOneToken}`)
      .send({
        status: "Resolved",
        resolutionNote,
      });

    expect(statusResponse.statusCode).toBe(200);
    expect(statusResponse.body.data.request.status).toBe("Resolved");
    expect(statusResponse.body.data.request.resolutionNote).toBe(resolutionNote);
    expect(statusResponse.body.data.request.resolutionDate).toBeTruthy();

    const contentResponse = await request(app)
      .put(`/api/requests/${ownedRequest._id}`)
      .set("Authorization", `Bearer ${agentOneToken}`)
      .send({ subject: "Agent should not be able to change this" });

    expect(contentResponse.statusCode).toBe(403);
  });

  test("manager can filter, sort and paginate service requests", async () => {
    const response = await request(app)
      .get(
        `/api/requests?search=${encodeURIComponent(
          suffix
        )}&severity=High&assignedAgent=${agentOne._id}&page=1&limit=5&sortBy=subject&sortOrder=asc`
      )
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.pagination.page).toBe(1);
    expect(response.body.data.pagination.limit).toBe(5);
    response.body.data.requests.forEach((serviceRequest) => {
      expect(serviceRequest.severity).toBe("High");
      expect(String(serviceRequest.assignedAgent._id)).toBe(
        agentOne._id.toString()
      );
    });
  });

  test("invalid date filter returns a meaningful 400 response", async () => {
    const response = await request(app)
      .get("/api/requests?startDate=not-a-date")
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid start date");
  });

  test("service request deletion is Admin-only", async () => {
    const serviceRequest = await ServiceRequest.create({
      requestNumber: `SR-DELETE-${suffix}`,
      customer: customer._id,
      subject: "Delete permission request",
      description: "Request used to verify delete permission.",
      category: "Delivery",
      severity: "Low",
      assignedAgent: agentOne._id,
      status: "Open",
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
    requestIds.push(serviceRequest._id);

    const managerResponse = await request(app)
      .delete(`/api/requests/${serviceRequest._id}`)
      .set("Authorization", `Bearer ${managerToken}`);
    expect(managerResponse.statusCode).toBe(403);

    const adminResponse = await request(app)
      .delete(`/api/requests/${serviceRequest._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminResponse.statusCode).toBe(200);
  });
});
