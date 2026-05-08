import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("rfid_token"));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("rfid_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("rfid_token"));
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("rfid_token", newToken);
    localStorage.setItem("rfid_user", JSON.stringify(newUser));
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("rfid_token");
    localStorage.removeItem("rfid_user");
    setTokenState(null);
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
