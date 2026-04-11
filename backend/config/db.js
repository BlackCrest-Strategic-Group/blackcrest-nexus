import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  console.log("Attempting to connect to MongoDB...");
  console.log("Connection string (redacted):", uri?.replace(/:[^@]+@/, ":***@"));
  
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✓ MongoDB connected successfully.");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

export default connectDB;
