import React, { createContext, useContext, useState, ReactNode } from "react";
import { authApi } from "@/services/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Student";
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("library_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      const { _id, name, email: userEmail, role, token } = response.data;
      
      const authUser: AuthUser = {
        id: _id,
        name,
        email: userEmail,
        role: role === "admin" ? "Admin" : "Student",
      };
      
      setUser(authUser);
      localStorage.setItem("library_user", JSON.stringify(authUser));
      localStorage.setItem("library_token", token);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: string = "student"): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.register({ name, email, password, role });
      const { _id, name: userName, email: userEmail, role: userRole, token } = response.data;
      
      const authUser: AuthUser = {
        id: _id,
        name: userName,
        email: userEmail,
        role: userRole === "admin" ? "Admin" : "Student",
      };
      
      setUser(authUser);
      localStorage.setItem("library_user", JSON.stringify(authUser));
      localStorage.setItem("library_token", token);
      return { success: true };
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("library_user");
    localStorage.removeItem("library_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
