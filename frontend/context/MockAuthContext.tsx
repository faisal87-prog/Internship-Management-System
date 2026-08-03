"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { users } from "@/mock/data";
import type { User } from "@/types";

interface MockAuthContextValue {
  user: User | null;
  isReady: boolean;
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

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, loginAs, logout }),
    [user, isReady, loginAs, logout],
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
