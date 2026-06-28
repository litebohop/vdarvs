"use client";

import type { User } from "@/types/entities.types";
import type { UserRole } from "@/types/common.types";
import { createClient } from "@/lib/supabase/client";
import { fetchProfileById } from "@/lib/supabase/queries/dashboard";
import { insertProfile } from "@/lib/supabase/queries/profiles";
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
  signup: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
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
      let profile = await fetchProfileById(session.user.id);
      if (!profile) {
        profile = await insertProfile({
          id: session.user.id,
          email: session.user.email ?? "",
          fullName:
            (session.user.user_metadata?.full_name as string | undefined) ??
            session.user.email ??
            "Unknown user",
          role: "citizen",
        });
      }
      if (!active) return;
      setUser(profile);
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
    let profile = await fetchProfileById(data.user.id);
    if (!profile) {
      profile = await insertProfile({
        id: data.user.id,
        email: data.user.email ?? "",
        fullName:
          (data.user.user_metadata?.full_name as string | undefined) ??
          data.user.email ??
          "Unknown user",
        role: "citizen",
      });
    }
    setUser(profile);
  }, []);

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      const supabase = supabaseRef.current;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Sign up failed");

      if (data.session) {
        const profile = await insertProfile({
          id: data.user.id,
          email,
          fullName,
          role: "citizen",
        });
        setUser(profile);
        return { needsEmailConfirmation: false };
      }

      return { needsEmailConfirmation: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    const supabase = supabaseRef.current;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
