import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { randomInt, createHash } from "crypto";
import ENV from "../config/env";
import { generateTokens, createUser, getUserById, createSession } from "../services/auth.service";
import { sendOtpEmail } from "../services/email.service";
import User from "../models/user.model";
import Talent from "../models/talents.model";
import Session from "../models/session.model";

// ─── OTP Helpers ───────────────────────────────────────────────────────────

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local[0];
  return `${visible}${"•".repeat(Math.min(local.length - 1, 5))}@${domain}`;
}

// ─── Auth Controller ────────────────────────────────────────────────────────

const authController = {
  // ── Local Registration (Admin / staff) ──────────────────────────────────
  async registerLocal(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role, phone }: any = req.body;

      if (!email || !password || !firstName || !role) {
        return res.status(400).json({
          message: "Email, password, first name and role are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate OTP
      const otp = generateOtp();
      const codeHash = hashOtp(otp);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      const user = await createUser(email, firstName, lastName, role, hashedPassword, undefined, phone) as any;

      // Store verification code
      await User.findByIdAndUpdate(user._id, {
        verificationCodeHash: codeHash,
        verificationCodeExpiresAt: expiresAt,
        verificationAttempts: 0,
        verificationLastSentAt: new Date(),
        emailVerified: false,
      });

      // Send OTP email (non-blocking)
      sendOtpEmail(email, firstName, otp, "verify").catch((err) =>
        console.error("Failed to send verification email:", err)
      );

      return res.status(201).json({
        message: "Account created. Please verify your email.",
        requiresVerification: true,
        email,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Registration failed", error: error.message });
    }
  },

  // ── Applicant Registration ───────────────────────────────────────────────
  async registerApplicant(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, headline, location }: any = req.body;

      if (!email || !password || !firstName) {
        return res.status(400).json({
          message: "Email, password, and first name are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const otp = generateOtp();
      const codeHash = hashOtp(otp);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      const user = await createUser(
        email, firstName, lastName || "", "applicant", hashedPassword, undefined, phone
      ) as any;

      // Create Talent profile
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

      await User.findByIdAndUpdate(user._id, {
        talentProfileId: talent._id.toString(),
        verificationCodeHash: codeHash,
        verificationCodeExpiresAt: expiresAt,
        verificationAttempts: 0,
        verificationLastSentAt: new Date(),
        emailVerified: false,
      });

      sendOtpEmail(email, firstName, otp, "verify").catch((err) =>
        console.error("Failed to send verification email:", err)
      );

      return res.status(201).json({
        message: "Account created. Please verify your email.",
        requiresVerification: true,
        email,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Registration failed", error: error.message });
    }
  },

  // ── Verify Email OTP ─────────────────────────────────────────────────────
  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ message: "Email and verification code are required" });
      }

      const user = await User.findOne({ email }).select(
        "+verificationCodeHash +verificationCodeExpiresAt +verificationAttempts"
      );

      if (!user) {
        return res.status(400).json({ message: "Invalid verification attempt" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      if (!user.verificationCodeHash || !user.verificationCodeExpiresAt) {
        return res.status(400).json({ message: "No verification code found. Please request a new one." });
      }

      if (new Date() > user.verificationCodeExpiresAt) {
        return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
      }

      if ((user.verificationAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({
          message: "Too many failed attempts. Please request a new verification code.",
        });
      }

      const inputHash = hashOtp(String(code).trim());
      if (inputHash !== user.verificationCodeHash) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { verificationAttempts: 1 },
        });
        const remaining = OTP_MAX_ATTEMPTS - ((user.verificationAttempts ?? 0) + 1);
        return res.status(400).json({
          message: remaining > 0
            ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many failed attempts. Please request a new code.",
        });
      }

      // Mark verified and clear code
      await User.findByIdAndUpdate(user._id, {
        emailVerified: true,
        verificationCodeHash: null,
        verificationCodeExpiresAt: null,
        verificationAttempts: 0,
      });

      const freshUser = await User.findById(user._id);
      if (!freshUser) {
        return res.status(500).json({ message: "Verification failed" });
      }

      const tokens = generateTokens(freshUser as any);

      await createSession(
        freshUser._id.toString(),
        tokens.accessToken,
        req.ip || "unknown",
        req.headers["user-agent"] || "unknown",
      );

      return res.status(200).json({
        message: "Email verified successfully",
        user: {
          _id: freshUser._id,
          email: freshUser.email,
          firstName: freshUser.firstName,
          lastName: freshUser.lastName,
          phone: (freshUser as any).phone,
          role: freshUser.role,
          talentProfileId: freshUser.talentProfileId,
          emailVerified: true,
        },
        tokens,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Verification failed", error: error.message });
    }
  },

  // ── Resend Verification Code ──────────────────────────────────────────────
  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await User.findOne({ email }).select("+verificationLastSentAt");

      if (!user) {
        // Don't reveal whether email exists
        return res.status(200).json({ message: "If an account with that email exists, a new code has been sent." });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Cooldown check
      if (user.verificationLastSentAt) {
        const secondsSinceLast = (Date.now() - new Date(user.verificationLastSentAt).getTime()) / 1000;
        if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
          const waitSeconds = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast);
          return res.status(429).json({
            message: `Please wait ${waitSeconds}s before requesting another code.`,
            retryAfter: waitSeconds,
          });
        }
      }

      const otp = generateOtp();
      const codeHash = hashOtp(otp);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await User.findByIdAndUpdate(user._id, {
        verificationCodeHash: codeHash,
        verificationCodeExpiresAt: expiresAt,
        verificationAttempts: 0,
        verificationLastSentAt: new Date(),
      });

      sendOtpEmail(user.email, user.firstName, otp, "verify").catch((err) =>
        console.error("Failed to send verification email:", err)
      );

      return res.status(200).json({ message: "A new verification code has been sent." });
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to resend code", error: error.message });
    }
  },

  // ── Forgot Password ───────────────────────────────────────────────────────
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Always return the same message regardless of whether account exists (enumeration protection)
      const genericMessage = "If an account is associated with this email, you'll receive a password reset code.";

      const user = await User.findOne({ email }).select("+passwordResetCodeHash +passwordResetLastSentAt");

      if (!user) {
        return res.status(200).json({ message: genericMessage });
      }

      // Cooldown using dedicated passwordResetLastSentAt (separate from email verification cooldown)
      if ((user as any).passwordResetLastSentAt) {
        const secondsSinceLast = (Date.now() - new Date((user as any).passwordResetLastSentAt).getTime()) / 1000;
        if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
          // Still return generic message to avoid timing attacks
          return res.status(200).json({ message: genericMessage });
        }
      }

      const otp = generateOtp();
      const codeHash = hashOtp(otp);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await User.findByIdAndUpdate(user._id, {
        passwordResetCodeHash: codeHash,
        passwordResetCodeExpiresAt: expiresAt,
        passwordResetAttempts: 0,
        passwordResetLastSentAt: new Date(),
      });

      sendOtpEmail(user.email, user.firstName, otp, "reset").catch((err) => {
        console.error(`[AUTH] Failed to send password reset email to ${user.email}:`, err.message || err);
      });

      return res.status(200).json({ message: genericMessage });
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to process request", error: error.message });
    }
  },

  // ── Reset Password (verify OTP + set new password) ────────────────────────
  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword, confirmPassword } = req.body;

      if (!email || !code || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Email, code, newPassword and confirmPassword are required" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      if (String(newPassword).trim().length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const user = await User.findOne({ email }).select(
        "+passwordResetCodeHash +passwordResetCodeExpiresAt +passwordResetAttempts"
      );

      if (!user) {
        return res.status(400).json({ message: "Invalid reset attempt" });
      }

      if (!user.passwordResetCodeHash || !user.passwordResetCodeExpiresAt) {
        return res.status(400).json({ message: "No reset code found. Please request a new one." });
      }

      if (new Date() > user.passwordResetCodeExpiresAt) {
        return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
      }

      if ((user.passwordResetAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({
          message: "Too many failed attempts. Please request a new reset code.",
        });
      }

      const inputHash = hashOtp(String(code).trim());
      if (inputHash !== user.passwordResetCodeHash) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { passwordResetAttempts: 1 },
        });
        const remaining = OTP_MAX_ATTEMPTS - ((user.passwordResetAttempts ?? 0) + 1);
        return res.status(400).json({
          message: remaining > 0
            ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many failed attempts. Please request a new code.",
        });
      }

      // Hash and set new password, clear reset code
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        passwordResetCodeHash: null,
        passwordResetCodeExpiresAt: null,
        passwordResetAttempts: 0,
      });

      // Invalidate all active sessions for security
      await Session.updateMany({ userId: user._id.toString() }, { isActive: false });

      return res.status(200).json({ message: "Password reset successfully. Please login with your new password." });
    } catch (error: any) {
      return res.status(500).json({ message: "Password reset failed", error: error.message });
    }
  },

  // ── Local Login ───────────────────────────────────────────────────────────
  async loginLocal(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Block unverified users
      if (!user.emailVerified) {
        // Re-send a fresh OTP to let them verify
        const otp = generateOtp();
        const codeHash = hashOtp(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await User.findByIdAndUpdate(user._id, {
          verificationCodeHash: codeHash,
          verificationCodeExpiresAt: expiresAt,
          verificationAttempts: 0,
          verificationLastSentAt: new Date(),
        });

        sendOtpEmail(user.email, user.firstName, otp, "verify").catch((err) =>
          console.error("Failed to send verification email:", err)
        );

        return res.status(403).json({
          message: "Please verify your email before logging in. A new code has been sent.",
          requiresVerification: true,
          email,
        });
      }

      const tokens = generateTokens(user as any);

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
          emailVerified: user.emailVerified,
        },
        tokens,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Login failed", error: error.message });
    }
  },

  // ── Get Current User ──────────────────────────────────────────────────────
  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const user = await getUserById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({ user });
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to get user", error: error.message });
    }
  },

  // ── Refresh Token ─────────────────────────────────────────────────────────
  async refreshToken(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found or inactive" });
      }

      const tokens = generateTokens(user);
      return res.status(200).json({ message: "Token refreshed", tokens });
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to refresh token", error: error.message });
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        await Session.findOneAndUpdate({ token }, { isActive: false });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: "Logout failed", error: error.message });
    }
  },

  // ── Update Profile ────────────────────────────────────────────────────────
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { firstName, lastName, picture, phone } = req.body;

      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, picture, phone },
        { returnDocument: "after" },
      );

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({ message: "Profile updated", user });
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  },

  // ── Update Password (authenticated) ──────────────────────────────────────
  async updatePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          message: "currentPassword, newPassword, confirmPassword required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      if (String(newPassword).trim().length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      const user = await User.findById(userId).select("+password");
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.password) {
        return res.status(400).json({ message: "Password not set for this account." });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return res.status(200).json({ message: "Password updated" });
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to update password", error: error.message });
    }
  },
};

export { authController };
