import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";

const router = Router();

// ==========================
// REGISTER
// POST /auth/register
// ==========================

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check email and password
    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB
    const newUser = await User.create({
      email: email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================
// LOGIN
// POST /auth/login
// ==========================

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    // Password incorrect
    if (!passwordMatch) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // ==========================
    // Create Access Token
    // ==========================

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "15m",
      }
    );

    // ==========================
    // Create Refresh Token
    // ==========================

    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // ==========================
    // Refresh Token Expiry
    // ==========================

    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // ==========================
    // Save Refresh Token
    // ==========================

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: refreshTokenExpiry,
    });

    // ==========================
    // Send Tokens
    // ==========================

    res.status(200).json({
      message: "Login successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================
// REFRESH ACCESS TOKEN
// POST /auth/refresh
// ==========================

router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Check refresh token
    if (!refreshToken) {
      res.status(401).json({
        message: "Refresh token required",
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as {
      userId: string;
    };

    // Find token in MongoDB
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    if (!storedToken) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({
        _id: storedToken._id,
      });

      res.status(401).json({
        message: "Refresh token expired",
      });
      return;
    }

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        message: "User not found",
      });
      return;
    }

    // Create new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "15m",
      }
    );

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
});

// ==========================
// LOGOUT
// POST /auth/logout
// ==========================

router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Check refresh token
    if (!refreshToken) {
      res.status(400).json({
        message: "Refresh token is required",
      });
      return;
    }

    // Delete refresh token from MongoDB
    const deletedToken = await RefreshToken.findOneAndDelete({
      token: refreshToken,
    });

    // Token not found
    if (!deletedToken) {
      res.status(404).json({
        message: "Refresh token not found",
      });
      return;
    }

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
