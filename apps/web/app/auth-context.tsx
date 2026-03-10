"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => ({ success: false }),
  signup: () => ({ success: false }),
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const STORAGE_KEY = "finetech_users";
const SESSION_KEY = "finetech_session";

function getUsers(): Record<string, { id: string; name: string; email: string; password: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(
  users: Record<string, { id: string; name: string; email: string; password: string }>,
) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        setUser(JSON.parse(session));
      }
    } catch {
      // ignore
    }
  }, []);

  const login = (email: string, password: string) => {
    const users = getUsers();
    const found = users[email.toLowerCase()];
    if (!found) return { success: false, error: "No account found with this email." };
    if (found.password !== password) return { success: false, error: "Incorrect password." };
    const u: User = { id: found.id, name: found.name, email: found.email };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return { success: true };
  };

  const signup = (name: string, email: string, password: string) => {
    const users = getUsers();
    const key = email.toLowerCase();
    if (users[key]) return { success: false, error: "An account with this email already exists." };
    const id = crypto.randomUUID();
    users[key] = { id, name, email: key, password };
    saveUsers(users);
    const u: User = { id, name, email: key };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
