import { endpoints } from "@/constants/api";
import React, { createContext, useContext, useMemo, useState } from "react";

type User = {
  id: number;
  username: string;
  is_staff: boolean;
};

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

    try {
      const meRes = await fetch(endpoints.me, {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      if (meRes.ok) {
        const me: User = await meRes.json();
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const signOut = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      signIn,
      signOut,
    }),
    [accessToken, refreshToken, user]
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