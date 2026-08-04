"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { resolveMockLogin } from "@/mock/auth";
import { users } from "@/mock/data";
import type { User } from "@/types";

interface MockAuthContextValue {
  user: User | null;
  isReady: boolean;
  login: (identifier: string, password: string) => { ok: true } | { ok: false; error: string };
  loginAs: (userId: string) => void;
  logout: () => void;
}

const STORAGE_KEY = "aimp-mock-user-id";

const MockAuthContext = createContext<MockAuthContextValue | undefined>(
  undefined,
);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = users.find((u) => u.id === stored && u.isActive) ?? null;
      setUser(found);
    }
    setIsReady(true);
  }, []);

  const loginAs = useCallback((userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (!found || !found.isActive) return;
    window.localStorage.setItem(STORAGE_KEY, found.id);
    setUser(found);
  }, []);

  const login = useCallback(
    (identifier: string, password: string) => {
      const result = resolveMockLogin(identifier, password);
      if ("error" in result) {
        return { ok: false as const, error: result.error };
      }
      const found = users.find((u) => u.id === result.userId);
      if (!found || !found.isActive) {
        return { ok: false as const, error: "This account is inactive." };
      }
      window.localStorage.setItem(STORAGE_KEY, found.id);
      setUser(found);
      return { ok: true as const };
    },
    [],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, loginAs, logout }),
    [user, isReady, login, loginAs, logout],
  );

  return (
    <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const ctx = useContext(MockAuthContext);
  if (!ctx) {
    throw new Error("useMockAuth must be used within MockAuthProvider");
  }
  return ctx;
}
