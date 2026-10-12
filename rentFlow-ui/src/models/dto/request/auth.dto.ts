import { User, UserRole } from "../../../models/User";

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;

  // Development only: dummy email, no verification link
  skipEmailVerification?: boolean;
}

export interface RegisterResponse {
  message: string;
  verificationRequired: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// A new Google user must add a phone number before the account exists
export interface GoogleProfileNeeded {
  needsProfile: true;
  signupToken: string;
  profile: {
    fullName: string;
    email: string;
  };
}

export type GoogleLoginResponse = AuthResponse | GoogleProfileNeeded;

export interface CompleteGoogleSignupRequest {
  signupToken: string;
  fullName: string;
  phone: string;
}