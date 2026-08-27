require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = require("../../src/app");

const User = require("../../src/models/User");
const Customer = require("../../src/models/Customer");
const ServiceRequest = require("../../src/models/ServiceRequest");
const Message = require("../../src/models/Message");

describe("Message API", () => {
  let testUser;
  let authToken;
  let customer;
  let serviceRequest;

  const testEmail = `message-test-${Date.now()}@example.com`;
  const testPassword = "Test@12345";

  beforeAll(async () => {
    /*
     * Make sure MongoDB connection is available.
     */
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    /*
     * Create test user.
     */
    const hashedPassword = await bcrypt.hash(
      testPassword,
      12
    );

    testUser = await User.create({
      name: "Message Test User",
      email: testEmail,
      password: hashedPassword,
    });

    /*
     * Login test user.
     */
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(loginResponse.statusCode).toBe(200);

    authToken = loginResponse.body.data.token;

    /*
     * Create test customer.
     */
    customer = await Customer.create({
      name: "Message Test Customer",
      email: `customer-${Date.now()}@example.com`,
      phone: "9876543210",
      customerType: "individual",
      accountStatus: "active",
    });

    /*
     * Create service request directly.
     *
     * This test focuses on the Message API,
     * so the service request is created directly.
     *
     * IMPORTANT:
     * category must match the ServiceRequest schema.
     * slaDeadline is required by the schema.
     */
    serviceRequest = await ServiceRequest.create({
      customer: customer._id,
      subject: "Message API Test Request",
      description: "Testing communication endpoints",
      severity: "Medium",
      category: "Technical Issue",
      status: "Open",
      slaDeadline: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),
    });
  });

  afterAll(async () => {
    /*
     * Cleanup messages.
     */
    if (serviceRequest) {
      await Message.deleteMany({
        request: serviceRequest._id,
      });

      /*
       * Cleanup service request.
       */
      await ServiceRequest.deleteOne({
        _id: serviceRequest._id,
      });
    }

    /*
     * Cleanup customer.
     */
    if (customer) {
      await Customer.deleteOne({
        _id: customer._id,
      });
    }

    /*
     * Cleanup test user.
     */
    if (testUser) {
      await User.deleteOne({
        _id: testUser._id,
      });
    }

    /*
     * Close MongoDB connection.
     */
    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.connection.close();
    }
  });

  describe(
    "POST /api/requests/:id/messages",
    () => {
      test(
        "should create a customer message",
        async () => {
          const response = await request(app)
            .post(
              `/api/requests/${serviceRequest._id}/messages`
            )
            .set(
              "Authorization",
              `Bearer ${authToken}`
            )
            .send({
              message:
                "This is a test customer message.",
              type: "customer",
            });

          expect(response.statusCode).toBe(201);

          expect(
            response.body.success
          ).toBe(true);

          expect(
            response.body.message
          ).toBe(
            "Message added successfully"
          );

          expect(
            response.body.data.message
          ).toHaveProperty("message");

          expect(
            response.body.data.message.message
          ).toBe(
            "This is a test customer message."
          );

          expect(
            response.body.data.message.type
          ).toBe("customer");
        }
      );

      test(
        "should create an internal message",
        async () => {
          const response = await request(app)
            .post(
              `/api/requests/${serviceRequest._id}/messages`
            )
            .set(
              "Authorization",
              `Bearer ${authToken}`
            )
            .send({
              message:
                "This is an internal note.",
              type: "internal",
            });

          expect(response.statusCode).toBe(201);

          expect(
            response.body.success
          ).toBe(true);

          expect(
            response.body.data.message.type
          ).toBe("internal");
        }
      );

      test(
        "should reject empty message",
        async () => {
          const response = await request(app)
            .post(
              `/api/requests/${serviceRequest._id}/messages`
            )
            .set(
              "Authorization",
              `Bearer ${authToken}`
            )
            .send({
              message: "",
              type: "customer",
            });

          expect(response.statusCode).toBe(400);

          expect(
            response.body.success
          ).toBe(false);

          expect(
            response.body.message
          ).toBe("Validation failed");
        }
      );

      test(
        "should reject invalid message type",
        async () => {
          const response = await request(app)
            .post(
              `/api/requests/${serviceRequest._id}/messages`
            )
            .set(
              "Authorization",
              `Bearer ${authToken}`
            )
            .send({
              message: "Invalid type test",
              type: "invalid",
            });

          expect(response.statusCode).toBe(400);

          expect(
            response.body.success
          ).toBe(false);
        }
      );

      test(
        "should reject unauthenticated request",
        async () => {
          const response = await request(app)
            .post(
              `/api/requests/${serviceRequest._id}/messages`
            )
            .send({
              message:
                "Unauthenticated message",
              type: "customer",
            });

          expect(response.statusCode).toBe(401);

          expect(
            response.body.success
          ).toBe(false);
        }
      );
    }
  );

  describe(
    "GET /api/requests/:id/messages",
    () => {
      test(
        "should retrieve messages for a service request",
        async () => {
          const response = await request(app)
            .get(
              `/api/requests/${serviceRequest._id}/messages`
            )
            .set(
              "Authorization",
              `Bearer ${authToken}`
            );

          expect(response.statusCode).toBe(200);

          expect(
            response.body.success
          ).toBe(true);

          expect(
            response.body.message
          ).toBe(
            "Messages fetched successfully"
          );

          expect(
            response.body.data.messages
          ).toBeInstanceOf(Array);

          expect(
            response.body.data.messages.length
          ).toBeGreaterThanOrEqual(2);

          expect(
            response.body.data
          ).toHaveProperty("pagination");
        }
      );

      test(
        "should support pagination",
        async () => {
          const response = await request(app)
            .get(
              `/api/requests/${serviceRequest._id}/messages?page=1&limit=1`
            )
            .set(
              "Authorization",
              `Bearer ${authToken}`
            );

          expect(response.statusCode).toBe(200);

          expect(
            response.body.data.messages
          ).toHaveLength(1);

          expect(
            response.body.data.pagination.limit
          ).toBe(1);
        }
      );

      test(
        "should reject invalid service request ID",
        async () => {
          const response = await request(app)
            .get(
              "/api/requests/invalid-id/messages"
            )
            .set(
              "Authorization",
              `Bearer ${authToken}`
            );

          expect(response.statusCode).toBe(400);

          expect(
            response.body.success
          ).toBe(false);
        }
      );
    }
  );
});