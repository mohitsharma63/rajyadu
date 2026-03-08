import { useCallback, useEffect, useMemo, useState } from "react";
import { oliRequest } from "@/lib/oliApi";

const AUTH_STORAGE_KEY = "poppik:auth:v1";
const AUTH_EVENT_NAME = "auth:update";

export type AuthUser = {
  id?: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
};

export type AuthSession = {
  user: AuthUser | null;
  token?: string;
  raw?: unknown;
};

function readSession(): AuthSession {
  if (typeof window === "undefined") return { user: null };
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null };
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed || typeof parsed !== "object") return { user: null };
    return {
      user: (parsed as AuthSession).user ?? null,
      token: (parsed as AuthSession).token,
      raw: (parsed as AuthSession).raw,
    };
  } catch {
    return { user: null };
  }
}

function writeSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

function normalizeSession(payload: unknown): AuthSession {
  const p = payload as any;
  const token = p?.token ?? p?.accessToken ?? p?.data?.token ?? p?.data?.accessToken;
  // Handle both AuthResponse format ({message, user}) and direct user object
  const user: AuthUser | null =
    p?.user ?? p?.data?.user ?? p?.profile ?? p?.data?.profile ?? (p && typeof p === "object" && !p.message ? p : null);

  if (!user || typeof user !== "object") {
    return { user: null, token: token ? String(token) : undefined, raw: payload };
  }

  return {
    user: user as AuthUser,
    token: token ? String(token) : undefined,
    raw: payload,
  };
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession>(() => readSession());

  useEffect(() => {
    const sync = () => setSession(readSession());
    window.addEventListener(AUTH_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isAuthenticated = useMemo(() => !!session.user, [session.user]);

  const displayName = useMemo(() => {
    const u = session.user;
    if (!u) return "";
    const fn = (u.firstName ?? "").toString().trim();
    const ln = (u.lastName ?? "").toString().trim();
    const full = `${fn} ${ln}`.trim();
    if (full) return full;
    const name = (u.name ?? "").toString().trim();
    if (name) return name;
    const email = (u.email ?? "").toString().trim();
    return email;
  }, [session.user]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await oliRequest("POST", "/api/auth/login", { email, password });
    const data = (await res.json()) as unknown;
    const next = normalizeSession(data);
    setSession(next);
    writeSession(next);
    return next;
  }, []);

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await oliRequest("POST", "/api/auth/register", payload);
      const data = (await res.json()) as unknown;
      const next = normalizeSession(data);
      setSession(next);
      writeSession(next);
      return next;
    },
    []
  );

  const adminLogin = useCallback(async (email: string, password: string) => {
    const res = await oliRequest("POST", "/api/admin/login", { email, password });
    const data = (await res.json()) as unknown;
    const next = normalizeSession(data);
    setSession(next);
    writeSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    const next: AuthSession = { user: null };
    setSession(next);
    writeSession(next);
  }, []);

  const isAdmin = useMemo(() => {
    return session.user?.isAdmin === true;
  }, [session.user]);

  return {
    session,
    user: session.user,
    token: session.token,
    isAuthenticated,
    isAdmin,
    displayName,
    login,
    adminLogin,
    register,
    logout,
  };
}
