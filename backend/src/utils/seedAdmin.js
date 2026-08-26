require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDatabase = require("../config/database");
const User = require("../models/User");
const { ROLES } = require("../constants/auth");

const seedAdmin = async () => {
  try {
    await connectDatabase();

    const {
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be configured"
      );
    }

    if (ADMIN_PASSWORD.length < 8) {
      throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User already exists: ${email}`);

      if (existingUser.role !== ROLES.ADMIN) {
        console.log(
          "Existing user is not an admin. No changes were made."
        );
      }

      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password: hashedPassword,
      role: ROLES.ADMIN,
      isActive: true,
    });

    console.log("Admin created successfully");
    console.log(`Admin email: ${admin.email}`);
    console.log(`Admin role: ${admin.role}`);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = require("mongoose");

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("Database connection closed");
    }
  }
};

seedAdmin();