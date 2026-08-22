import mongoose from "mongoose";

// Cache connection for serverless environments
let isConnected = false;

const connectDB = async (): Promise<void> => {
  // If already connected, reuse the connection
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    // Set mongoose options for serverless
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(process.env.MONGO_URI!, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", (error as Error).message);
    isConnected = false;
    throw error; // Don't exit in serverless, just throw
  }
};

export default connectDB;
