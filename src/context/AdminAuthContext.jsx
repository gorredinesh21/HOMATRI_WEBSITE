"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  adminApi,
  extractToken,
  getAdminToken,
  isLocalAdminSession,
  setAdminToken,
  setLocalAdminSession,
} from "@/lib/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [localSession, setLocalSession] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isLocalAdminSession()) {
        if (!cancelled) {
          setLocalSession(true);
          setAdmin({ email: "ops@local", name: "Local operations" });
          setReady(true);
        }
        return;
      }
      const stored = getAdminToken();
      if (stored) setToken(stored);
      try {
        const me = await adminApi.me();
        if (cancelled) return;
        setAdmin(me?.admin || me?.user || me);
      } catch {
        if (!cancelled) setAdmin(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await adminApi.login(email, password);
    const nextToken = extractToken(result);
    if (nextToken) setAdminToken(nextToken);
    setToken(nextToken);
    setLocalAdminSession(false);
    setLocalSession(false);
    try {
      const me = await adminApi.me();
      setAdmin(me?.admin || me?.user || me || { email });
    } catch {
      setAdmin({ email });
    }
    return result;
  }, []);

  const enterLocalSession = useCallback(() => {
    setLocalAdminSession(true);
    setLocalSession(true);
    setAdmin({ email: "ops@local", name: "Local operations" });
    setReady(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!isLocalAdminSession()) await adminApi.logout();
    } catch {
      /* ignore */
    }
    setAdminToken(null);
    setLocalAdminSession(false);
    setToken(null);
    setLocalSession(false);
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      token,
      ready,
      localSession,
      isAuthenticated: Boolean(admin) || Boolean(token) || localSession,
      login,
      enterLocalSession,
      logout,
    }),
    [admin, token, ready, localSession, login, enterLocalSession, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
