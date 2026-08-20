import { Request, Response } from "express";
import { model } from "mongoose";
import User from "../models/user.model";
import Session from "../models/session.model";
import bcrypt from "bcrypt";

const userController = {
  // Get active sessions
  async getSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const sessions = await Session.find({ userId, isActive: true }).sort({
        lastAccess: -1,
      });
      return res.status(200).json({ sessions });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to fetch sessions", error: error.message });
    }
  },

  // Revoke a session
  async revokeSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { sessionId } = req.params;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const session = await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        { isActive: false },
        { returnDocument: "after" },
      );

      if (!session)
        return res.status(404).json({ message: "Session not found" });

      return res.status(200).json({ message: "Session revoked successfully" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to revoke session", error: error.message });
    }
  },

  // Update password
  async updatePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findById(userId).select("+password");
      if (!user) return res.status(404).json({ message: "User not found" });

      // If user has a password, verify current password
      if (user.password) {
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required" });
        }
        const isMatch = await (user as any).comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: "Invalid current password" });
      }

      // If user doesn't have a password yet, they can just set a new one
      user.password = newPassword;
      await user.save();

      return res.status(200).json({ message: user.password ? "Password updated successfully" : "Password created successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to update password", error: error.message });
    }
  },

  // Update notification preferences
  async updateNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { email, push, sms, marketing } = req.body;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            notifications: { email, push, sms, marketing },
          },
        },
        { returnDocument: "after" },
      );

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({
        message: "Notifications updated successfully",
        notifications: user.notifications,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to update notifications",
        error: error.message,
      });
    }
  },

  // Toggle 2FA
  async toggle2FA(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { enabled } = req.body;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { twoFactorEnabled: enabled } },
        { returnDocument: "after" },
      );

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({
        message: `Two-Factor Authentication ${enabled ? "enabled" : "disabled"} successfully`,
        twoFactorEnabled: user.twoFactorEnabled,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to toggle 2FA", error: error.message });
    }
  },

  // Delete account
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // If talent, delete talent profile
      if (user.talentProfileId) {
        await (model("Talent") as any).findByIdAndDelete(user.talentProfileId);
      }

      await User.findByIdAndDelete(userId);
      await Session.deleteMany({ userId });

      return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to delete account", error: error.message });
    }
  },
};

export default userController;
