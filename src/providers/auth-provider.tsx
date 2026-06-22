"use client";

import type { User } from "@/types/entities.types";
import type { UserRole } from "@/types/common.types";
import { MOCK_USERS } from "@/lib/mock-data";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AUTH_STORAGE_KEY = "vdarvs-auth-user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      document.cookie = `vdarvs-role=${nextUser.role};path=/;max-age=86400`;
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      document.cookie = "vdarvs-role=;path=/;max-age=0";
    }
  }, []);

  const login = useCallback(
    async (email: string, role?: UserRole) => {
      const found =
        MOCK_USERS.find((u) => u.email === email) ??
        MOCK_USERS.find((u) => u.role === (role ?? "village_chief"));
      if (!found) throw new Error("Invalid credentials");
      persistUser(role ? { ...found, role } : found);
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const switchRole = useCallback(
    (role: UserRole) => {
      const base = MOCK_USERS.find((u) => u.role === role);
      if (base) persistUser(base);
    },
    [persistUser],
  );

  const value = useMemo(
    () => ({ user, isLoading, login, logout, switchRole }),
    [user, isLoading, login, logout, switchRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
