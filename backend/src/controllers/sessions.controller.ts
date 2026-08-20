import { Request, Response } from "express";
import Session from "../models/session.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessions = await Session.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const formattedSessions = sessions.map((session) => ({
      id: session._id,
      ip: session.ipAddress || "Unknown",
      userAgent: session.userAgent || "Unknown",
      createdAt: session.createdAt,
      isCurrent: session.token === req.token,
    }));

    return res.status(200).json(formattedSessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    return res.status(500).json({ message: "Failed to get sessions" });
  }
};

export const terminateSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Don't allow terminating current session via this endpoint
    if (session.token === req.token) {
      return res.status(400).json({ message: "Cannot terminate current session" });
    }

    session.isActive = false;
    await session.save();

    return res.status(200).json({ message: "Session terminated" });
  } catch (error) {
    console.error("Terminate session error:", error);
    return res.status(500).json({ message: "Failed to terminate session" });
  }
};
