const request = require("supertest");

const User = require("../../src/models/User");
const Customer = require("../../src/models/Customer");
const ServiceRequest = require("../../src/models/ServiceRequest");
const Message = require("../../src/models/Message");
const AuditLog = require("../../src/models/AuditLog");
const {
  app,
  connectTestDatabase,
  createTestUser,
  loginTestUser,
  closeTestDatabase,
} = require("../helpers/testHelpers");

describe("AI APIs", () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const password = "Test@12345";

  let agent;
  let otherAgent;
  let token;
  let otherToken;
  let customer;
  let serviceRequest;
  let originalFetch;
  let originalApiKey;

  const mockGeminiJson = (value) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(value) }],
            },
          },
        ],
      }),
    });
  };

  beforeAll(async () => {
    await connectTestDatabase();

    originalFetch = global.fetch;
    originalApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-gemini-key";

    ({ user: agent } = await createTestUser({
      name: "AI Test Agent",
      email: `ai-agent-${suffix}@example.com`,
      password,
      role: "agent",
    }));
    ({ user: otherAgent } = await createTestUser({
      name: "AI Other Agent",
      email: `ai-other-${suffix}@example.com`,
      password,
      role: "agent",
    }));

    token = await loginTestUser(agent.email, password);
    otherToken = await loginTestUser(otherAgent.email, password);

    customer = await Customer.create({
      name: "AI Test Customer",
      email: `ai-customer-${suffix}@example.com`,
      phone: "+1-555-0300",
      company: "AI Test Company",
      location: "Boston, MA",
      customerType: "business",
      accountStatus: "active",
    });

    serviceRequest = await ServiceRequest.create({
      requestNumber: `SR-AI-${suffix}`,
      customer: customer._id,
      subject: "Billing portal is unavailable",
      description: "Customer cannot open the billing portal after signing in.",
      category: "Billing",
      severity: "High",
      assignedAgent: agent._id,
      status: "Under Investigation",
      slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
    });

    await Message.create({
      request: serviceRequest._id,
      author: agent._id,
      type: "customer",
      message: "The customer confirmed the issue also occurs in another browser.",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    global.fetch = originalFetch;

    if (originalApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalApiKey;
    }

    await AuditLog.deleteMany({ entityId: serviceRequest._id });
    await Message.deleteMany({ request: serviceRequest._id });
    await ServiceRequest.deleteOne({ _id: serviceRequest._id });
    await Customer.deleteOne({ _id: customer._id });
    await User.deleteMany({ _id: { $in: [agent._id, otherAgent._id] } });
    await closeTestDatabase();
  });

  test("generates a structured conversation summary", async () => {
    mockGeminiJson({
      customerProblem: "Customer cannot access the billing portal.",
      importantDetails: ["Issue occurs in multiple browsers."],
      actionsTaken: ["Browser behavior was compared."],
      currentStatus: "Under investigation.",
      recommendedNextAction: "Verify billing portal permissions.",
    });

    const response = await request(app)
      .post(`/api/requests/${serviceRequest._id}/ai/summary`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.summary.customerProblem).toContain(
      "billing portal"
    );
    expect(response.body.data.summary.importantDetails).toEqual(
      expect.any(Array)
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("generates an editable response suggestion without creating a message", async () => {
    mockGeminiJson({
      response:
        "Thanks for the additional details. We are reviewing your billing portal access and will continue with the next diagnostic step.",
    });

    const messagesBefore = await Message.countDocuments({
      request: serviceRequest._id,
    });

    const response = await request(app)
      .post(`/api/requests/${serviceRequest._id}/ai/suggest-response`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.suggestion).toContain("additional details");

    const messagesAfter = await Message.countDocuments({
      request: serviceRequest._id,
    });
    expect(messagesAfter).toBe(messagesBefore);
  });

  test("recommends an allowed category and severity for a new issue", async () => {
    mockGeminiJson({
      category: "Technical Issue",
      severity: "High",
      reason: "A core customer workflow is blocked.",
    });

    const response = await request(app)
      .post("/api/requests/ai/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({
        subject: "Application login fails",
        description: "Customer receives an error on every login attempt.",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.recommendation).toEqual({
      category: "Technical Issue",
      severity: "High",
      reason: "A core customer workflow is blocked.",
    });
  });

  test("rejects AI access to another agent's request", async () => {
    mockGeminiJson({
      customerProblem: "Should not be returned",
      importantDetails: [],
      actionsTaken: [],
      currentStatus: "Open",
      recommendedNextAction: "None",
    });

    const response = await request(app)
      .post(`/api/requests/${serviceRequest._id}/ai/summary`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("returns 502 when the AI provider fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const response = await request(app)
      .post("/api/requests/ai/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({
        subject: "Payment problem",
        description: "Payment completed but account access is not active.",
      });

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe("AI provider request failed");
  });

  test("returns 502 for malformed or invalid structured AI output", async () => {
    mockGeminiJson({
      category: "Made Up Category",
      severity: "Extreme",
      reason: "Invalid enum values",
    });

    const response = await request(app)
      .post("/api/requests/ai/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({
        subject: "Account issue",
        description: "Customer needs help with account access.",
      });

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe("AI provider returned an invalid response");
  });

  test("validates AI analysis input before calling the provider", async () => {
    global.fetch = jest.fn();

    const response = await request(app)
      .post("/api/requests/ai/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({ subject: "x", description: "no" });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("details");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
