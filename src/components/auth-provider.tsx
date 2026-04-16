"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { authService } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = React.useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      refresh,
      logout,
    }),
    [loading, logout, refresh, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  }

  return context;
}
