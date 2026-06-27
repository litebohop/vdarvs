"use client";

import type { User } from "@/types/entities.types";
import type { UserRole } from "@/types/common.types";
import { createClient } from "@/lib/supabase/client";
import { fetchProfileById } from "@/lib/supabase/queries/dashboard";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    let active = true;

    async function loadProfile(session: Session | null) {
      if (!session?.user) {
        if (active) setUser(null);
        return;
      }
      const profile = await fetchProfileById(session.user.id);
      if (!active) return;
      // Fall back to a minimal citizen profile if the row is missing so the
      // app stays usable, but the role always comes from the database.
      setUser(
        profile ?? {
          id: session.user.id,
          email: session.user.email ?? "",
          fullName: session.user.email ?? "Unknown user",
          role: "citizen",
          createdAt: session.user.created_at ?? new Date().toISOString(),
        },
      );
    }

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        await loadProfile(data.session);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = supabaseRef.current;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    const profile = await fetchProfileById(data.user.id);
    setUser(
      profile ?? {
        id: data.user.id,
        email: data.user.email ?? "",
        fullName: data.user.email ?? "Unknown user",
        role: "citizen",
        createdAt: data.user.created_at ?? new Date().toISOString(),
      },
    );
  }, []);

  const logout = useCallback(async () => {
    const supabase = supabaseRef.current;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
