"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db, MockUser } from "./mockStore";

interface AuthCtx {
  user: MockUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lms:session");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function login(email: string, password: string): boolean {
    const found = db.users.findByEmail(email);
    if (!found || found.password !== password || !found.isActive) return false;
    setUser(found);
    localStorage.setItem("lms:session", JSON.stringify(found));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("lms:session");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
