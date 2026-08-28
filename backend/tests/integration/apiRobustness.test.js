const request = require("supertest");
const { app } = require("../helpers/testHelpers");

describe("API robustness safeguards", () => {
  test("returns 400 for malformed JSON instead of an internal server error", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":"broken@example.com",');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid JSON payload",
    });
  });

  test("rejects request bodies larger than the configured limit", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(
        JSON.stringify({
          email: "large@example.com",
          password: "x".repeat(1024 * 1024 + 1000),
        })
      );

    expect(response.statusCode).toBe(413);
    expect(response.body.message).toBe("Request body is too large");
  });
});
