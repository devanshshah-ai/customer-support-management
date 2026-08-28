const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const customerRoutes = require("./routes/customerRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const messageRoutes = require("./routes/messageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 500 : 2000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", apiLimiter);

app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/requests", serviceRequestRoutes);
app.use("/api/requests", messageRoutes);
app.use("/api/requests", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditLogRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Customer Support Management API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  } else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON payload";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier";
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with the same unique value already exists";
  }

  const response = {
    success: false,
    message: statusCode === 500 ? "Internal server error" : message,
  };

  if (err.details && statusCode < 500) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
