import { Schema, model } from "mongoose";
import { IUser } from "../types/user.types";
import bcrypt from "bcrypt";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      // required: true,
    },
    phone: {
      type: String,
    },
    picture: {
      type: String,
    },
    role: {
      type: String,
      enum: ["applicant", "admin"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    talentProfileId: {
      type: String,
      ref: "Talent",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    // Email verification
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCodeHash: {
      type: String,
      select: false,
    },
    verificationCodeExpiresAt: {
      type: Date,
      select: false,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
    },
    verificationLastSentAt: {
      type: Date,
    },
    // Password reset
    passwordResetCodeHash: {
      type: String,
      select: false,
    },
    passwordResetCodeExpiresAt: {
      type: Date,
      select: false,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

const User = model<IUser>("User", userSchema);

export default User;
