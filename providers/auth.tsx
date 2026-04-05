import { endpoints } from "@/constants/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type User = {
  id: number;
  username: string;
  is_staff: boolean;
};

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  authReady: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = "unibangla_access_token";
const REFRESH_TOKEN_KEY = "unibangla_refresh_token";
const USER_KEY = "unibangla_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const savedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedAccessToken) {
        setAccessToken(savedAccessToken);
      }

      if (savedRefreshToken) {
        setRefreshToken(savedRefreshToken);
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
    } finally {
      setAuthReady(true);
    }
  }, []);

  const signIn = async (username: string, password: string) => {
    const payload = {
      username: username.trim(),
      password,
    };

    const res = await fetch(endpoints.token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let message = "Authentication failed";

      try {
        const data = await res.json();
        message = data?.detail || data?.error || message;
      } catch {
        // ignore invalid JSON
      }

      throw new Error(message);
    }

    const data: { access: string; refresh: string } = await res.json();

    setAccessToken(data.access);
    setRefreshToken(data.refresh);

    localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);

    try {
      const meRes = await fetch(endpoints.me, {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      if (meRes.ok) {
        const me: User = await meRes.json();
        setUser(me);
        localStorage.setItem(USER_KEY, JSON.stringify(me));
      } else {
        setUser(null);
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      setUser(null);
      localStorage.removeItem(USER_KEY);
    }
  };

  const signOut = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      authReady,
      signIn,
      signOut,
    }),
    [accessToken, refreshToken, user, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}