import { Schema, model } from "mongoose";
import { ISession } from "../types/user.types";

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    lastAccess: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });

const Session = model<ISession>("Session", sessionSchema);

export default Session;
