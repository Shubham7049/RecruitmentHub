import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

dotenv.config();

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    const adminEmail = "admin@recruitmenthub.com";
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { username: "superadmin" }, { role: "admin" }],
    });

    if (existingAdmin) {
      console.log(`ℹ️ An Admin user already exists with email: ${existingAdmin.email} (Username: ${existingAdmin.username})`);
      console.log("You can log in directly using this account.");
      process.exit(0);
    }

    const adminUser = await User.create({
      fullname: "Platform Administrator",
      email: adminEmail,
      username: "superadmin",
      password: "AdminPassword123!",
      role: "admin",
      phone: "1234567890",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
    });

    console.log("✅ Admin user seeded successfully!");
    console.log("-----------------------------------------");
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Password: AdminPassword123!`);
    console.log(`Role:     admin`);
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
