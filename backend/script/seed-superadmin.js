import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db-client.js";
import SaasAdmin from "../models/SaasAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { config } = await import("../config/env.js");

async function seedSuperAdmin() {
  try {
    console.log("🔄 Connecting to database...");
    await db.connect(config.mongoUri);
    console.log("✅ Database connected");

    // Check if SaaS Super Admin already exists
    const existingSuperAdmin = await SaasAdmin.findOne({ email: "superadmin@bireena.com" });
    if (existingSuperAdmin) {
      console.log("⚠️  SaaS Super Admin already exists!");
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.name}`);
      await db.disconnect();
      process.exit(0);
    }

    // Create SaaS Super Admin
    console.log("\n📝 Creating SaaS Super Admin...");
    const superAdmin = new SaasAdmin({
      name: "SaaS Super Admin",
      email: "superadmin@bireena.com",
      isActive: true,
    });

    // Set password
    await superAdmin.setPassword("SuperAdmin@123");
    await superAdmin.save();

    console.log("✅ SaaS Super Admin created successfully!");
    console.log("\n🔑 SuperAdmin Login Credentials:");
    console.log("   Email: superadmin@bireena.com");
    console.log("   Password: SuperAdmin@123");

    console.log("\n📋 SuperAdmin Details:");
    console.log(`   ID: ${superAdmin._id}`);
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Active: ${superAdmin.isActive}`);
    console.log(`   Created: ${superAdmin.createdAt}`);

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
seedSuperAdmin();
