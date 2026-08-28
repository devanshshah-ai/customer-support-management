const request = require("supertest");

const Customer = require("../../src/models/Customer");
const ServiceRequest = require("../../src/models/ServiceRequest");
const User = require("../../src/models/User");
const {
  app,
  connectTestDatabase,
  createTestUser,
  loginTestUser,
  closeTestDatabase,
} = require("../helpers/testHelpers");

describe("Customer API", () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const password = "Test@12345";

  let admin;
  let agent;
  let adminToken;
  let agentToken;
  const customerIds = [];

  beforeAll(async () => {
    await connectTestDatabase();

    ({ user: admin } = await createTestUser({
      name: "Customer Test Admin",
      email: `customer-admin-${suffix}@example.com`,
      password,
      role: "admin",
    }));

    ({ user: agent } = await createTestUser({
      name: "Customer Test Agent",
      email: `customer-agent-${suffix}@example.com`,
      password,
      role: "agent",
    }));

    adminToken = await loginTestUser(admin.email, password);
    agentToken = await loginTestUser(agent.email, password);
  });

  afterAll(async () => {
    await ServiceRequest.deleteMany({ customer: { $in: customerIds } });
    await Customer.deleteMany({ _id: { $in: customerIds } });
    await User.deleteMany({ _id: { $in: [admin._id, agent._id] } });
    await closeTestDatabase();
  });

  test("agent can create a customer and email is normalized", async () => {
    const response = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({
        name: "Acme Support Contact",
        email: `ACME-${suffix}@EXAMPLE.COM`,
        phone: "+1-555-0100",
        company: "Acme Inc",
        location: "New York, NY",
        customerType: "business",
        accountStatus: "active",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customer.email).toBe(
      `acme-${suffix}@example.com`
    );

    customerIds.push(response.body.data.customer.id);
  });

  test("rejects a duplicate customer email", async () => {
    const response = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Duplicate Customer",
        email: `acme-${suffix}@example.com`,
        phone: "+1-555-0101",
        customerType: "business",
        accountStatus: "active",
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
  });

  test("supports search, filters, sorting and pagination", async () => {
    const extraCustomers = await Customer.create([
      {
        name: "Beta Enterprise",
        email: `beta-${suffix}@example.com`,
        phone: "+1-555-0102",
        company: "Beta Corp",
        location: "Austin, TX",
        customerType: "enterprise",
        accountStatus: "active",
      },
      {
        name: "Gamma Consumer",
        email: `gamma-${suffix}@example.com`,
        phone: "+1-555-0103",
        company: "",
        location: "Seattle, WA",
        customerType: "individual",
        accountStatus: "inactive",
      },
    ]);

    customerIds.push(...extraCustomers.map((customer) => customer._id));

    const response = await request(app)
      .get(
        `/api/customers?search=Beta&customerType=enterprise&accountStatus=active&page=1&limit=1&sortBy=name&sortOrder=asc`
      )
      .set("Authorization", `Bearer ${agentToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.customers).toHaveLength(1);
    expect(response.body.data.customers[0].name).toBe("Beta Enterprise");
    expect(response.body.data.pagination.currentPage).toBe(1);
    expect(response.body.data.pagination.pageLimit).toBe(1);
  });

  test("returns customer profile with service request history", async () => {
    const customer = await Customer.create({
      name: "History Customer",
      email: `history-${suffix}@example.com`,
      phone: "+1-555-0104",
      customerType: "individual",
      accountStatus: "active",
    });
    customerIds.push(customer._id);

    await ServiceRequest.create({
      requestNumber: `SR-HISTORY-${suffix}`,
      customer: customer._id,
      subject: "History request",
      description: "A request used to verify customer history.",
      category: "Technical Issue",
      severity: "Medium",
      status: "Open",
      assignedAgent: agent._id,
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const response = await request(app)
      .get(`/api/customers/${customer._id}`)
      .set("Authorization", `Bearer ${agentToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.customer.name).toBe("History Customer");
    expect(response.body.data.serviceRequestCount).toBe(1);
    expect(response.body.data.serviceRequests[0].subject).toBe("History request");
  });

  test("updates customer information", async () => {
    const customer = await Customer.create({
      name: "Update Customer",
      email: `update-${suffix}@example.com`,
      phone: "+1-555-0105",
      customerType: "individual",
      accountStatus: "active",
    });
    customerIds.push(customer._id);

    const response = await request(app)
      .put(`/api/customers/${customer._id}`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ company: "Updated Company", accountStatus: "suspended" });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.customer.company).toBe("Updated Company");
    expect(response.body.data.customer.accountStatus).toBe("suspended");
  });

  test("rejects invalid customer payloads", async () => {
    const response = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ name: "", email: "not-an-email", phone: "1" });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty("details");
  });

  test("only admin can delete a customer", async () => {
    const customer = await Customer.create({
      name: "Delete Customer",
      email: `delete-${suffix}@example.com`,
      phone: "+1-555-0106",
      customerType: "individual",
      accountStatus: "active",
    });
    customerIds.push(customer._id);

    const agentResponse = await request(app)
      .delete(`/api/customers/${customer._id}`)
      .set("Authorization", `Bearer ${agentToken}`);

    expect(agentResponse.statusCode).toBe(403);

    const adminResponse = await request(app)
      .delete(`/api/customers/${customer._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(adminResponse.statusCode).toBe(200);
  });
});
