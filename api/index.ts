import { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "../src/config/db";
import app from "../src/app";

// Load environment variables
dotenv.config();

// Connect to MongoDB before handling requests
let dbConnected = false;

const handler = async (req: Request, res: Response) => {
  // Ensure DB connection on cold start
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      return res.status(500).json({ 
        message: "Database connection failed" 
      });
    }
  }

  // Handle the request with Express app
  return app(req, res);
};

export default handler;
