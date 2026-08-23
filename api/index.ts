import dotenv from "dotenv";
import connectDB from "../src/config/db";
import app from "../src/app";

// Load environment variables (for local development; Vercel injects them automatically)
dotenv.config();

// Connect to MongoDB — db.ts caches the connection via the isConnected flag,
// so repeated cold-start invocations on Vercel reuse the existing connection.
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Export the Express app directly — @vercel/node accepts Application as default export.
export default app;
