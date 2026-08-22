export type UserRole = "applicant" | "admin";

export interface IUser {
  _id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  picture?: string;
  role: UserRole;
  isActive: boolean;
  talentProfileId?: string;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  // Email verification
  emailVerified?: boolean;
  verificationCodeHash?: string;
  verificationCodeExpiresAt?: Date;
  verificationAttempts?: number;
  verificationLastSentAt?: Date;
  // Password reset
  passwordResetCodeHash?: string;
  passwordResetCodeExpiresAt?: Date;
  passwordResetAttempts?: number;
  passwordResetLastSentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISession {
  _id?: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  lastAccess: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface IAuthResponse {
  user: IUser;
  tokens: IAuthTokens;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
