'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User { name: string; email: string; role: 'coordinator' | 'volunteer'; }

interface Auth {
  user: User | null;
  login: (email: string, password: string) => string | null;
  signup: (name: string, email: string, password: string) => string | null;
  logout: () => void;
}

const Ctx = createContext<Auth | null>(null);
const SESSION_KEY = 'bddc-session';
const USERS_KEY = 'bddc-users';

// Demo accounts (passwords stored plainly — demo only; use a real auth provider in production)
const DEMO: Record<string, { password: string; user: User }> = {
  'admin@blooddrive.org': { password: 'admin123', user: { name: 'Drive Coordinator', email: 'admin@blooddrive.org', role: 'coordinator' } },
  'volunteer@blooddrive.org': { password: 'volunteer123', user: { name: 'Camp Volunteer', email: 'volunteer@blooddrive.org', role: 'volunteer' } },
};

function loadUsers(): Record<string, { password: string; user: User }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return { ...DEMO, ...JSON.parse(raw) };
  } catch {}
  return { ...DEMO };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const login = (email: string, password: string): string | null => {
    const users = loadUsers();
    const rec = users[email.trim().toLowerCase()];
    if (!rec) return 'No account found for this email. Try a demo account or sign up.';
    if (rec.password !== password) return 'Incorrect password.';
    setUser(rec.user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(rec.user));
    return null;
  };

  const signup = (name: string, email: string, password: string): string | null => {
    email = email.trim().toLowerCase();
    if (!name.trim()) return 'Please enter your name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    const users = loadUsers();
    if (users[email]) return 'Account already exists — please log in.';
    const user: User = { name: name.trim(), email, role: 'volunteer' };
    users[email] = { password, user };
    try {
      const custom: Record<string, any> = {};
      Object.keys(users).forEach(k => { if (!DEMO[k]) custom[k] = users[k]; });
      localStorage.setItem(USERS_KEY, JSON.stringify(custom));
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {}
    setUser(user);
    return null;
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  };

  return <Ctx.Provider value={{ user, login, signup, logout }}>{ready ? children : <div className="container muted">Loading…</div>}</Ctx.Provider>;
}

export function useAuth() {
  const a = useContext(Ctx);
  if (!a) throw new Error('useAuth must be used inside AuthProvider');
  return a;
}

// Guard for protected pages — redirects to /login when signed out.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user === null) {
      // small delay so localStorage session can load
      const t = setTimeout(() => router.replace('/login'), 400);
      return () => clearTimeout(t);
    }
  }, [user, router]);
  if (!user) return <div className="container"><div className="card muted">Checking sign-in… redirecting to login.</div></div>;
  return <>{children}</>;
}
