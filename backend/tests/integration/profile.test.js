const request = require("supertest");
const bcrypt = require("bcryptjs");

const User = require("../../src/models/User");
const AuditLog = require("../../src/models/AuditLog");
const {
  app,
  connectTestDatabase,
  createTestUser,
  loginTestUser,
  closeTestDatabase,
} = require("../helpers/testHelpers");

describe("Profile self-service API", () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const originalPassword = "Test@12345";
  const newPassword = "Changed@12345";

  let user;
  let token;

  beforeAll(async () => {
    await connectTestDatabase();
    ({ user } = await createTestUser({
      name: "Profile Test Agent",
      email: `profile-${suffix}@example.com`,
      password: originalPassword,
      role: "agent",
    }));
    token = await loginTestUser(user.email, originalPassword);
  });

  afterAll(async () => {
    await AuditLog.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });
    await closeTestDatabase();
  });

  test("returns the authenticated user's own profile", async () => {
    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user.email).toBe(user.email);
    expect(response.body.data.user).not.toHaveProperty("password");
  });

  test("persists name and email updates", async () => {
    const updatedEmail = `profile-updated-${suffix}@example.com`;

    const response = await request(app)
      .put("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Profile Agent",
        email: updatedEmail,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user.name).toBe("Updated Profile Agent");
    expect(response.body.data.user.email).toBe(updatedEmail);

    const stored = await User.findById(user._id);
    expect(stored.email).toBe(updatedEmail);
    user.email = updatedEmail;
  });

  test("rejects password change when current password is wrong", async () => {
    const response = await request(app)
      .put("/api/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "Wrong@12345",
        newPassword,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Current password is incorrect");
  });

  test("rejects reusing the current password", async () => {
    const response = await request(app)
      .put("/api/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: originalPassword,
        newPassword: originalPassword,
      });

    expect(response.statusCode).toBe(400);
  });

  test("changes password securely and allows login with the new password", async () => {
    const response = await request(app)
      .put("/api/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: originalPassword,
        newPassword,
      });

    expect(response.statusCode).toBe(200);

    const stored = await User.findById(user._id).select("+password");
    expect(await bcrypt.compare(newPassword, stored.password)).toBe(true);
    expect(stored.password).not.toBe(newPassword);

    const oldLogin = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: originalPassword,
    });
    expect(oldLogin.statusCode).toBe(401);

    const newLogin = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: newPassword,
    });
    expect(newLogin.statusCode).toBe(200);
  });

  test("rejects profile access without authentication", async () => {
    const response = await request(app).get("/api/profile");
    expect(response.statusCode).toBe(401);
  });
});
