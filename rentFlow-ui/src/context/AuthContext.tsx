import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import {
  login as loginApi,
  register as registerApi,
  me as meApi,
} from "../api";

import { User } from "../models/User";

import {
  LoginRequest,
  RegisterRequest,
} from "../models/dto/request/auth.dto";

import {
  saveToken,
  getToken,
  saveUser,
  getUser,
  clearAuth,
} from "../services/storage/authStorage";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = token !== null;

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await getToken();

      if (!storedToken) {
        return;
      }

      const user = await meApi();

      await saveUser(user);

      setToken(storedToken);
      setUser(user);
    } catch (error) {
      console.error("Failed to restore session:", error);

      await clearAuth();

      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    data: LoginRequest
  ): Promise<void> => {
    const response = await loginApi(data);

    await saveToken(response.token);
    await saveUser(response.user);

    setToken(response.token);
    setUser(response.user);
  };

  const register = async (
    data: RegisterRequest
  ): Promise<void> => {
    await registerApi(data);
  };

  const logout = async (): Promise<void> => {
    await clearAuth();

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}