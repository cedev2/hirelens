import { Request, Response } from "express";
import bcrypt from "bcrypt";
import ENV from "../config/env";
import { generateTokens, createUser, getUserById, createSession } from "../services/auth.service";
import User from "../models/user.model";
import Talent from "../models/talents.model";
import Session from "../models/session.model";

const authController = {
  // Local Registration (Email/Password)
  async registerLocal(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role, phone }: any =
        req.body;

      if (!email || !password || !firstName || !role) {
        return res.status(400).json({
          message: "Email, password, first name and role are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await createUser(
        email,
        firstName,
        lastName,
        role,
        hashedPassword,
        undefined,
        phone,
      );
      const tokens = generateTokens(user);

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        },
        tokens,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Registration failed",
        error: error.message,
      });
    }
  },

  // Local Login
  async loginLocal(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      const tokens = generateTokens(user as any);

      // Create session for tracking
      await createSession(
        user._id.toString(),
        tokens.accessToken,
        req.ip || "unknown",
        req.headers["user-agent"] || "unknown",
      );

      return res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: (user as any).phone,
          role: user.role,
          talentProfileId: user.talentProfileId,
        },
        tokens,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Login failed",
        error: error.message,
      });
    }
  },

  // Get current user
  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        user,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to get user",
        error: error.message,
      });
    }
  },

  // Refresh token
  async refreshToken(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await User.findById(userId);

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found or inactive" });
      }

      const tokens = generateTokens(user);

      return res.status(200).json({
        message: "Token refreshed",
        tokens,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to refresh token",
        error: error.message,
      });
    }
  },

  // Logout
  async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        await Session.findOneAndUpdate({ token }, { isActive: false });
      }
      return res.status(200).json({
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Logout failed", error: error.message });
    }
  },

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { firstName, lastName, picture, phone } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, picture, phone },
        { returnDocument: "after" },
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "Profile updated",
        user,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to update profile",
        error: error.message,
      });
    }
  },

  // Update password (Local accounts)
  async updatePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const {
        currentPassword,
        newPassword,
        confirmPassword,
      }: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          message: "currentPassword, newPassword, confirmPassword required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      if (String(newPassword).trim().length < 8) {
        return res
          .status(400)
          .json({ message: "New password must be at least 8 characters" });
      }

      const user = await User.findById(userId).select("+password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.password) {
        return res.status(400).json({
          message: "Password not set for this account.",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ message: "Password updated" });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to update password",
        error: error.message,
      });
    }
  },

  // Applicant Registration (creates User + Talent profile)
  async registerApplicant(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, headline, location }: any =
        req.body;

      if (!email || !password || !firstName) {
        return res.status(400).json({
          message: "Email, password, and first name are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await createUser(
        email,
        firstName,
        lastName || "",
        "applicant",
        hashedPassword,
        undefined,
        phone,
      ) as any;

      // Create Talent profile linked to the applicant user
      const talent = await Talent.create({
        userId: user._id,
        headline: headline || "Job Seeker",
        location: location || "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
        availability: { status: "Available", type: "Full-time" },
        socialLinks: [],
      });

      // Update user with talentProfileId
      await User.findByIdAndUpdate(user._id, { talentProfileId: talent._id.toString() });

      const tokens = generateTokens(user);

      return res.status(201).json({
        message: "Applicant registered successfully",
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          talentProfileId: user.talentProfileId,
        },
        tokens,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Registration failed",
        error: error.message,
      });
    }
  },
};

export { authController };
