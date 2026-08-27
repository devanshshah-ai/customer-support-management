require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = require("../../src/app");
const User = require("../../src/models/User");

describe("Authentication API", () => {
  const testEmail = `auth-test-${Date.now()}@example.com`;
  const testPassword = "Test@12345";

  beforeAll(async () => {
    // Make sure MongoDB connection is available.
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Remove test user.
    await User.deleteOne({
      email: testEmail,
    });

    await mongoose.connection.close();
  });

  describe("POST /api/auth/register", () => {
    test("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Auth Test User",
          email: testEmail,
          password: testPassword,
        });

      expect(response.statusCode).toBe(201);

      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "User registered successfully"
      );

      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user).toHaveProperty(
        "name",
        "Auth Test User"
      );
      expect(response.body.data.user).toHaveProperty(
        "email",
        testEmail
      );

      // Password must never be returned.
      expect(
        response.body.data.user.password
      ).toBeUndefined();
    });

    test("should reject duplicate email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Duplicate User",
          email: testEmail,
          password: testPassword,
        });

      expect(response.statusCode).toBe(409);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "User with this email already exists"
      );
    });

    test("should reject invalid registration data", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "",
          email: "invalid-email",
          password: "123",
        });

      expect(response.statusCode).toBe(400);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Validation failed"
      );

      expect(response.body).toHaveProperty("details");
    });
  });

  describe("POST /api/auth/login", () => {
    test("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Login successful"
      );

      expect(response.body.data).toHaveProperty(
        "token"
      );

      expect(response.body.data.token).toEqual(
        expect.any(String)
      );

      expect(response.body.data.user).toHaveProperty(
        "email",
        testEmail
      );
    });

    test("should reject incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword@123",
        });

      expect(response.statusCode).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Invalid email or password"
      );
    });

    test("should reject non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "does-not-exist@example.com",
          password: testPassword,
        });

      expect(response.statusCode).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Invalid email or password"
      );
    });

    test("should reject invalid login data", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: "",
        });

      expect(response.statusCode).toBe(400);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Validation failed"
      );

      expect(response.body).toHaveProperty("details");
    });
  });

  describe("Inactive user", () => {
    const inactiveEmail = `inactive-${Date.now()}@example.com`;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash(
        testPassword,
        12
      );

      await User.create({
        name: "Inactive Test User",
        email: inactiveEmail,
        password: hashedPassword,
        isActive: false,
      });
    });

    afterAll(async () => {
      await User.deleteOne({
        email: inactiveEmail,
      });
    });

    test("should reject login for inactive user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: inactiveEmail,
          password: testPassword,
        });

      expect(response.statusCode).toBe(403);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Your account is inactive"
      );
    });
  });
});