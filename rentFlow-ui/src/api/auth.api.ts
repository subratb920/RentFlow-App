import client from "./apiClient";
import {
    AuthResponse,
    CompleteGoogleSignupRequest,
    GoogleLoginResponse,
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
} from "../models/dto/request/auth.dto";
import { UserRole } from "../models/User";

export async function register(
    data: RegisterRequest
): Promise<RegisterResponse> {
    const response = await client.post("/auth/register", data);

    return response.data;
}

export async function resendVerification(email: string): Promise<void> {
    await client.post("/auth/resend-verification", { email });
}

export async function login(
    data: LoginRequest
) {
    const response = await client.post("/auth/login", data);

    return response.data;
}

export async function googleLogin(
    idToken: string,
    role: UserRole
): Promise<GoogleLoginResponse> {
    const response = await client.post("/auth/google", { idToken, role });

    return response.data;
}

export async function completeGoogleSignup(
    data: CompleteGoogleSignupRequest
): Promise<AuthResponse> {
    const response = await client.post("/auth/google/complete", data);

    return response.data;
}

export async function me() {
    const response = await client.get("/auth/me");

    return response.data;
}