import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");

    // Sync indexes to remove any stale/unused unique indexes (like unique index on userId)
    import("../models/Patient.js")
      .then(async (module) => {
        try {
          await module.default.syncIndexes();
          console.log("🔄 Patient collection indexes synchronized");
        } catch (err) {
          try {
            await module.default.collection.dropIndex("userId_1");
            console.log("🗑️ Manually dropped duplicate index userId_1");
          } catch (dropErr) {
            // Ignore if index doesn't exist
          }
        }
      })
      .catch(() => {});
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB;
