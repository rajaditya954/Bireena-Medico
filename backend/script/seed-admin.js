import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db, { setTenantContext } from "../config/db-client.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { config } = await import("../config/env.js");
const defaultHospitalId = "000000000000000000000000";

async function seedAdmin() {
  try {
    console.log("🔄 Connecting to database...");
    await db.connect(config.mongoUri);
    console.log("✅ Database connected");

    // Ensure default hospital exists or find it
    let defaultHospital = await Hospital.findOne({ _id: defaultHospitalId });
    if (!defaultHospital) {
      defaultHospital = await Hospital.create({
        _id: defaultHospitalId,
        name: "Default Hospital",
        slug: "default-hospital",
        email: "admin@medico.com",
        isActive: true,
        settings: {
          adminEmail: "admin@medico.com",
          adminPassword: "medicouseradmin",
          adminName: "Admin User",
          adminPhone: "9876543210"
        }
      });
      console.log("🏥 Created Default Hospital instance");
    }

    setTenantContext(defaultHospitalId);
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@medico.com" });
    if (!existingAdmin) {
      // Create admin user
      console.log("\n📝 Creating default admin user...");
      const admin = new User({
        employeeId: "EMP001",
        name: "Admin User",
        username: "admin.medico",
        email: "admin@medico.com",
        phone: "9876543210",
        role: "admin",
        isActive: true,
        hospital_id: defaultHospitalId,
      });
      await admin.setPassword("medicouseradmin");
      await admin.save();
      console.log("✅ Default admin user created successfully!");
    } else {
      console.log("⚠️ Default admin user already exists!");
    }

    // Now seed the additional hospitals
    console.log("\n🏥 Seeding additional hospitals...");

    // 1. City Care Clinic
    let cityCareHospital = await Hospital.findOne({ slug: "city-care" });
    if (!cityCareHospital) {
      cityCareHospital = await Hospital.create({
        name: "City Care Clinic",
        slug: "city-care",
        email: "admin@citycare.com",
        phone: "9876543211",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        address: "101 Nariman Point",
        maxUsers: 50,
        subscriptionPlan: "pro",
        isActive: true,
        settings: {
          adminEmail: "admin@citycare.com",
          adminPassword: "citycareadmin",
          adminName: "City Admin",
          adminPhone: "9876543211",
          enablePharmacy: true,
          enableLaboratory: true,
          enableReception: true,
          enableBilling: true,
        }
      });
      console.log("  Hospital 'City Care Clinic' created.");
    }
    
    setTenantContext(cityCareHospital._id);
    const existingCityAdmin = await User.findOne({ email: "admin@citycare.com" });
    if (!existingCityAdmin) {
      const cityCareAdmin = new User({
        employeeId: "EMP001",
        name: "City Admin",
        username: "admin.citycare",
        email: "admin@citycare.com",
        phone: "9876543211",
        role: "admin",
        isActive: true,
        hospital_id: cityCareHospital._id,
      });
      await cityCareAdmin.setPassword("citycareadmin");
      await cityCareAdmin.save();
      console.log("  Admin for 'City Care Clinic' created.");
    }

    // 2. Metro General Hospital
    let metroHospital = await Hospital.findOne({ slug: "metro-general" });
    if (!metroHospital) {
      metroHospital = await Hospital.create({
        name: "Metro General Hospital",
        slug: "metro-general",
        email: "admin@metrogeneral.com",
        phone: "9876543212",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        address: "202 Connaught Place",
        maxUsers: 100,
        subscriptionPlan: "enterprise",
        isActive: true,
        settings: {
          adminEmail: "admin@metrogeneral.com",
          adminPassword: "metrogeneraladmin",
          adminName: "Metro Admin",
          adminPhone: "9876543212",
          enablePharmacy: true,
          enableLaboratory: true,
          enableReception: true,
          enableBilling: true,
        }
      });
      console.log("  Hospital 'Metro General Hospital' created.");
    }

    setTenantContext(metroHospital._id);
    const existingMetroAdmin = await User.findOne({ email: "admin@metrogeneral.com" });
    if (!existingMetroAdmin) {
      const metroAdmin = new User({
        employeeId: "EMP001",
        name: "Metro Admin",
        username: "admin.metrogeneral",
        email: "admin@metrogeneral.com",
        phone: "9876543212",
        role: "admin",
        isActive: true,
        hospital_id: metroHospital._id,
      });
      await metroAdmin.setPassword("metrogeneraladmin");
      await metroAdmin.save();
      console.log("  Admin for 'Metro General Hospital' created.");
    }

    // 3. Apollo Diagnostics
    let apolloHospital = await Hospital.findOne({ slug: "apollo-diag" });
    if (!apolloHospital) {
      apolloHospital = await Hospital.create({
        name: "Apollo Diagnostics",
        slug: "apollo-diag",
        email: "admin@apollodiag.com",
        phone: "9876543213",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        address: "303 Indiranagar",
        maxUsers: 25,
        subscriptionPlan: "basic",
        isActive: true,
        settings: {
          adminEmail: "admin@apollodiag.com",
          adminPassword: "apollodiagadmin",
          adminName: "Apollo Admin",
          adminPhone: "9876543213",
          enablePharmacy: false,
          enableLaboratory: true,
          enableReception: false,
          enableBilling: true,
        }
      });
      console.log("  Hospital 'Apollo Diagnostics' created.");
    }

    setTenantContext(apolloHospital._id);
    const existingApolloAdmin = await User.findOne({ email: "admin@apollodiag.com" });
    if (!existingApolloAdmin) {
      const apolloAdmin = new User({
        employeeId: "EMP001",
        name: "Apollo Admin",
        username: "admin.apollodiag",
        email: "admin@apollodiag.com",
        phone: "9876543213",
        role: "admin",
        isActive: true,
        hospital_id: apolloHospital._id,
      });
      await apolloAdmin.setPassword("apollodiagadmin");
      await apolloAdmin.save();
      console.log("  Admin for 'Apollo Diagnostics' created.");
    }

    // Restore context
    setTenantContext(defaultHospitalId);

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
