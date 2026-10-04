import { User } from "../../../models/User";

export interface AuthResponse {
    token: string;
    user: User;
}