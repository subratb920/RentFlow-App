import axios from "axios";
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
  googleLogin as googleLoginApi,
  completeGoogleSignup as completeGoogleSignupApi,
} from "../api";
import { getGoogleIdToken, googleSignOut } from "../services/googleSignIn";

import { setUnauthorizedHandler } from "../api/apiClient";
import { User, UserRole } from "../models/User";

import {
  AuthResponse,
  CompleteGoogleSignupRequest,
  GoogleProfileNeeded,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
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
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;

  // Signs in with Google. Returns the profile step for new users,
  // or null when signed in (or the user cancelled the picker).
  loginWithGoogle: (role: UserRole) => Promise<GoogleProfileNeeded | null>;
  completeGoogleSignup: (data: CompleteGoogleSignupRequest) => Promise<void>;
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
    // An expired or invalid token sends the user back to login.
    setUnauthorizedHandler(() => {
      logout();
    });

    restoreSession();

    return () => setUnauthorizedHandler(null);
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
      if (isSessionRejected(error)) {
        await clearAuth();

        setToken(null);
        setUser(null);
      } else {
        // Server unreachable or failing: keep the stored session
        // rather than logging the user out for being offline.
        console.warn("Could not verify session:", error);

        const storedToken = await getToken();
        const storedUser = await getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (response: AuthResponse) => {
    await saveToken(response.token);
    await saveUser(response.user);

    setToken(response.token);
    setUser(response.user);
  };

  const login = async (
    data: LoginRequest
  ): Promise<void> => {
    await startSession(await loginApi(data));
  };

  const loginWithGoogle = async (
    role: UserRole
  ): Promise<GoogleProfileNeeded | null> => {
    const idToken = await getGoogleIdToken();

    if (!idToken) {
      return null;
    }

    try {
      const response = await googleLoginApi(idToken, role);

      if ("needsProfile" in response) {
        return response;
      }

      await startSession(response);

      return null;
    } catch (error) {
      // Let the user pick a different Google account next time
      await googleSignOut();

      throw error;
    }
  };

  const completeGoogleSignup = async (
    data: CompleteGoogleSignupRequest
  ): Promise<void> => {
    await startSession(await completeGoogleSignupApi(data));
  };

  const register = async (
    data: RegisterRequest
  ): Promise<RegisterResponse> => {
    return await registerApi(data);
  };

  const logout = async (): Promise<void> => {
    await clearAuth();
    await googleSignOut();

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
        loginWithGoogle,
        completeGoogleSignup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// The server answered and refused the session (invalid token,
// account no longer exists), as opposed to being unreachable.
function isSessionRejected(error: unknown): boolean {
  const status = axios.isAxiosError(error)
    ? error.response?.status
    : undefined;

  return status !== undefined && status >= 400 && status < 500;
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