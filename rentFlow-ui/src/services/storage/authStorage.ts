import AsyncStorage from "@react-native-async-storage/async-storage";

import type { User } from "../../models/User";

const AUTH_TOKEN_KEY = "AUTH_TOKEN";
const AUTH_USER_KEY = "AUTH_USER";

export async function saveToken(token: string) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function saveUser(user: User) {
    await AsyncStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(user)
    );
}

export async function getUser(): Promise<User | null> {
    const value = await AsyncStorage.getItem(AUTH_USER_KEY);

    if (!value) {
        return null;
    }

    return JSON.parse(value);
}

export async function clearAuth() {
    await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        AUTH_USER_KEY,
    ]);
}