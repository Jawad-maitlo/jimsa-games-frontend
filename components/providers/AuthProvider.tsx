"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile } from "../../shared/types/user";
import { apiFetch, getStoredToken, setStoredToken } from "../../lib/api";
import { resetSocket } from "../../lib/socket";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<void>;
  continueAsGuest: (displayName?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await apiFetch<{ user: UserProfile }>("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
      setStoredToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    const data = await apiFetch<{ user: UserProfile; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    setStoredToken(data.token);
    resetSocket();
    setUser(data.user);
  };

  const register = async (input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => {
    const data = await apiFetch<{ user: UserProfile; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setStoredToken(data.token);
    resetSocket();
    setUser(data.user);
  };

  const continueAsGuest = async (displayName?: string) => {
    const data = await apiFetch<{ user: UserProfile; token: string }>("/api/auth/guest", {
      method: "POST",
      body: JSON.stringify({ displayName }),
    });
    setStoredToken(data.token);
    resetSocket();
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors during logout
    }
    setStoredToken(null);
    resetSocket();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, login, register, continueAsGuest, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
