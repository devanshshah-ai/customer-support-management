require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = require("../../src/app");

const User = require("../../src/models/User");
const Notification = require("../../src/models/Notification");

describe("Notification API", () => {
  let testUser;
  let authToken;
  let notification1;
  let notification2;

  const testEmail = `notification-test-${Date.now()}@example.com`;
  const testPassword = "Test@12345";

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash(
      testPassword,
      12
    );

    testUser = await User.create({
      name: "Notification Test User",
      email: testEmail,
      password: hashedPassword,
    });

    // Login and get JWT
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(loginResponse.statusCode).toBe(200);

    authToken = loginResponse.body.data.token;

    // Create test notifications directly
    notification1 = await Notification.create({
      recipient: testUser._id,
      type: "GENERAL",
      title: "Test Notification 1",
      message: "This is the first test notification.",
    });

    notification2 = await Notification.create({
      recipient: testUser._id,
      type: "STATUS_CHANGED",
      title: "Status Updated",
      message: "Your service request status was updated.",
    });
  });

  afterAll(async () => {
    await Notification.deleteMany({
      recipient: testUser._id,
    });

    await User.deleteOne({
      _id: testUser._id,
    });

    await mongoose.connection.close();
  });

  describe("GET /api/notifications", () => {
    test("should retrieve user notifications", async () => {
      const response = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Notifications retrieved successfully"
      );

      expect(
        response.body.data.notifications
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "Test Notification 1",
          }),
          expect.objectContaining({
            title: "Status Updated",
          }),
        ])
      );

      expect(
        response.body.data
      ).toHaveProperty("unreadCount");

      expect(
        response.body.data
      ).toHaveProperty("pagination");
    });

    test("should return only unread notifications", async () => {
      const response = await request(app)
        .get("/api/notifications?unreadOnly=true")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      response.body.data.notifications.forEach(
        (notification) => {
          expect(notification.isRead).toBe(false);
        }
      );
    });

    test("should support pagination", async () => {
      const response = await request(app)
        .get("/api/notifications?page=1&limit=1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);

      expect(
        response.body.data.notifications
      ).toHaveLength(1);

      expect(
        response.body.data.pagination.pageLimit
      ).toBe(1);
    });

    test("should reject unauthenticated request", async () => {
      const response = await request(app)
        .get("/api/notifications");

      expect(response.statusCode).toBe(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/notifications/:id/read", () => {
    test("should mark a notification as read", async () => {
      const response = await request(app)
        .patch(
          `/api/notifications/${notification1._id}/read`
        )
        .set(
          "Authorization",
          `Bearer ${authToken}`
        );

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Notification marked as read"
      );

      expect(
        response.body.data.notification.isRead
      ).toBe(true);

      expect(
        response.body.data.notification.readAt
      ).not.toBeNull();
    });

    test("should return 404 for notification belonging to another user", async () => {
      const anotherUser = await User.create({
        name: "Another Notification User",
        email: `another-${Date.now()}@example.com`,
        password: await bcrypt.hash(
          testPassword,
          12
        ),
      });

      const otherNotification =
        await Notification.create({
          recipient: anotherUser._id,
          type: "GENERAL",
          title: "Private Notification",
          message: "This belongs to another user.",
        });

      const response = await request(app)
        .patch(
          `/api/notifications/${otherNotification._id}/read`
        )
        .set(
          "Authorization",
          `Bearer ${authToken}`
        );

      expect(response.statusCode).toBe(404);

      expect(response.body.success).toBe(false);

      await Notification.deleteOne({
        _id: otherNotification._id,
      });

      await User.deleteOne({
        _id: anotherUser._id,
      });
    });
  });

  describe("PATCH /api/notifications/read-all", () => {
    test("should mark all notifications as read", async () => {
      const response = await request(app)
        .patch("/api/notifications/read-all")
        .set(
          "Authorization",
          `Bearer ${authToken}`
        );

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "All notifications marked as read"
      );

      expect(
        response.body.data
      ).toHaveProperty("updatedCount");

      expect(
        response.body.data.updatedCount
      ).toBeGreaterThanOrEqual(1);

      const unreadCount =
        await Notification.countDocuments({
          recipient: testUser._id,
          isRead: false,
        });

      expect(unreadCount).toBe(0);
    });
  });
});