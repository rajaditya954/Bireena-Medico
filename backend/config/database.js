import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer = null;

export async function connectDB(uri) {
  try {
    mongoose.set("strictQuery", true);

    let connectUri = uri;
    if (!connectUri) {
      // Fallback to an in-memory MongoDB for development/testing when no URI provided
      memoryServer = await MongoMemoryServer.create();
      connectUri = memoryServer.getUri();
      console.log("ℹ️  No MONGO_URI provided — using in-memory MongoDB for dev/tests");
    }

    await mongoose.connect(connectUri);
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

export async function stopMemoryServer() {
  if (memoryServer) {
    await memoryServer.stop();
  }
}

export default connectDB;
