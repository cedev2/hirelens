import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Session from "../models/session.model";
import ENV from "../config/env";
import { IUser, UserRole } from "../types/user.types";

export async function createSession(
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string,
) {
  return await Session.create({
    userId,
    token,
    ipAddress,
    userAgent,
    lastAccess: new Date(),
    isActive: true,
  });
}

export function generateTokens(user: IUser) {
  const payload = {
    userId: user._id!.toString(),
    email: user.email,
    role: user.role,
  };

  const expiresIn = "24h";

  const accessToken = jwt.sign(payload, ENV.jwt_secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });

  return { accessToken };
}

export function verifyToken(token: string) {
  return jwt.verify(token, ENV.jwt_secret) as {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export async function createUser(
  email: string,
  firstName: string,
  lastName: string,
  role: UserRole,
  password?: string,
  picture?: string,
  phone?: string,
  talentProfileId?: string,
): Promise<IUser> {
  const userDoc = new User({
    email,
    password,
    firstName,
    lastName,
    picture,
    phone,
    role,
    talentProfileId,
  });

  await userDoc.save();
  const user = userDoc.toObject() as IUser;
  return user;
}

export async function getUserById(userId: string): Promise<IUser | null> {
  const userDoc = await User.findById(userId).select("+password").lean();
  if (!userDoc) return null;

  return {
    ...(userDoc as any),
    hasPassword: !!(userDoc as any).password,
  } as any;
}
