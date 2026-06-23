#!/usr/bin/env node

/**
 * Seed Script - Create Initial Admin User
 * 
 * Usage:
 * node backend/script/seed-admin.js
 * 
 * This creates the first admin user for system bootstrap.
 * Run this ONCE before starting the application for the first time.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db-client.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { config } = await import("../config/env.js");

async function seedAdmin() {
  try {
    console.log("🔄 Connecting to database...");
    await db.connect(config.mongoUri);
    console.log("✅ Database connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@medico.com" });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log("\nℹ️  To create a different admin, change the email in this script.");
      await db.disconnect();
      process.exit(0);
    }

    // Create admin user
    console.log("\n📝 Creating admin user...");
    const admin = new User({
      employeeId: "EMP001",
      name: "Admin User",
      username: "admin.medico",
      email: "admin@medico.com",
      phone: "9876543210",
      role: "ADMIN",
      isActive: true,
    });

    // Set password
    await admin.setPassword("medicouseradmin");
    await admin.save();

    console.log("✅ Admin user created successfully!");
    console.log("\n🔑 Login Credentials:");
    console.log("   Email: admin@medico.com");
    console.log("   Username: admin.medico");
    console.log("   Password: medicouseradmin");
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");
    console.log("   Use: POST /api/users/change-password endpoint");

    console.log("\n📋 Admin Details:");
    console.log(`   ID: ${admin._id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
    console.log(`   Created: ${admin.createdAt}`);

    console.log("\n✨ Seed completed successfully!\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

// Run seed
seedAdmin();
