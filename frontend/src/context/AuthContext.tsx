import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, clearToken, getToken, setToken } from "../api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | string;
  avatar_url?: string | null;
};

type AuthResponse = {
  token?: string;
  user?: AuthUser;
};

type MeResponse = AuthUser | { user?: AuthUser };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractUser(data: MeResponse): AuthUser | null {
  if (data && typeof data === "object" && "user" in data) {
    return data.user ?? null;
  }
  return data as AuthUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setTokenState(null);
      setUser(null);
      return;
    }

    const data = await apiRequest<MeResponse>("/me");
    setTokenState(currentToken);
    setUser(extractUser(data));
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        await refreshMe();
      } catch {
        clearToken();
        if (active) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiRequest<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!data.token) {
      throw new Error("Login response did not include a token.");
    }

    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user ?? null);

    if (!data.user) {
      await refreshMe();
    }
  }, [refreshMe]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      password_confirmation: string,
    ) => {
      const data = await apiRequest<AuthResponse>("/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });

      if (!data.token) {
        throw new Error("Register response did not include a token.");
      }

      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user ?? null);

      if (!data.user) {
        await refreshMe();
      }
    },
    [refreshMe],
  );

  const logout = useCallback(async () => {
    if (getToken()) {
      try {
        await apiRequest<unknown>("/logout", { method: "POST" });
      } catch {
        // Local logout should still complete if the token is already invalid.
      }
    }

    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role?.trim() === "admin",
      loading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, token, loading, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
