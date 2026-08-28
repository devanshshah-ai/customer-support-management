require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const request = require("supertest");

const app = require("../../src/app");
const User = require("../../src/models/User");

const connectTestDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to run integration tests");
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
};

const createTestUser = async ({
  name,
  email,
  password = "Test@12345",
  role = "agent",
  isActive = true,
}) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    isActive,
  });

  return { user, password };
};

const loginTestUser = async (email, password = "Test@12345") => {
  const response = await request(app).post("/api/auth/login").send({
    email,
    password,
  });

  if (response.statusCode !== 200) {
    throw new Error(
      `Unable to login test user ${email}: ${response.statusCode} ${response.body?.message || ""}`
    );
  }

  return response.body.data.token;
};

const closeTestDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

module.exports = {
  app,
  connectTestDatabase,
  createTestUser,
  loginTestUser,
  closeTestDatabase,
};
