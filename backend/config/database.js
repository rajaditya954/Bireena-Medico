import dbClient from "./db-client.js";

export async function connectDB(uri) {
  try {
    await dbClient.connect(uri);
    console.log("✅ Supabase/SQL database client connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

export async function stopMemoryServer() {
  await dbClient.disconnect();
}

export default connectDB;
