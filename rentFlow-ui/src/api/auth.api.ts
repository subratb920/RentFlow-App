import client from "./apiClient";
import { LoginRequest } from "../models/dto/request/auth.dto";

export async function register(data: {
    fullName: string;
    email: string;
    password: string;
}) {
    const response = await client.post("/auth/register", data);

    return response.data;
}

export async function login(
    data: LoginRequest
) {
    console.log("➡️ loginApi called");
    const response = await client.post("/auth/login", data);
    console.log("✅ API response", response.data);

    return response.data;
}

export async function me() {
    const response = await client.get("/auth/me");

    return response.data;
}