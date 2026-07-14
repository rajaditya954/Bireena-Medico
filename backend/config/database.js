import dbClient, { clearTenantContext } from "./db-client.js";

export async function connectDB(uri) {
  try {
    await dbClient.connect(uri);
    console.log("✅ Supabase/SQL database client connected successfully");

    // Startup migration hook for default hospital admin credentials
    try {
      clearTenantContext();
      const Hospital = dbClient.model("Hospital");
      if (Hospital) {
        const defaultHospital = await Hospital.findOne({ slug: "default-hospital" });
        if (defaultHospital) {
          let updated = false;
          if (!defaultHospital.settings) {
            defaultHospital.settings = {};
            updated = true;
          }
          if (!defaultHospital.settings.adminEmail) {
            defaultHospital.settings.adminEmail = "admin@medico.com";
            updated = true;
          }
          if (!defaultHospital.settings.adminPassword) {
            defaultHospital.settings.adminPassword = "medicouseradmin";
            updated = true;
          }
          if (!defaultHospital.settings.adminName) {
            defaultHospital.settings.adminName = "Admin User";
            updated = true;
          }
          if (!defaultHospital.settings.adminPhone) {
            defaultHospital.settings.adminPhone = "9876543210";
            updated = true;
          }
          if (updated) {
            await defaultHospital.save();
            console.log("🔄 Default hospital settings migrated successfully with admin credentials");
          }
        }
      }
    } catch (migErr) {
      console.error("⚠️ Default hospital settings migration failed:", migErr.message);
    } finally {
      clearTenantContext();
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

export async function stopMemoryServer() {
  await dbClient.disconnect();
}

export default connectDB;
