import dotenv from "dotenv";
import connectDB from "./config/db";
import app from "./app";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);

// ==========================
// MongoDB Connection
// ==========================

connectDB();

// ==========================
// START SERVER (Local Development Only)
// ==========================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

