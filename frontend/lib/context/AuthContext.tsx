"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, FitnessProfile } from "../types";
import { api } from "../api";

interface AuthContextType {
  user: User | null;
  profile: FitnessProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<FitnessProfile>) => Promise<FitnessProfile>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Initialize theme and auth on mount
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem("fitgenius_theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      setIsDarkMode(true); // Default to sleek obsidian dark mode
    }

    // Auth
    const savedToken = localStorage.getItem("fitgenius_token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fitgenius_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fitgenius_theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const fetchUserData = async () => {
    try {
      const currentUser = await api.getMe();
      setUser(currentUser);
      const userProfile = await api.getProfile();
      setProfile(userProfile);
    } catch (err) {
      console.warn("Session expired or invalid, logging out:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      localStorage.setItem("fitgenius_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      const userProfile = await api.getProfile();
      setProfile(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      const data = await api.register(email, pass, name);
      localStorage.setItem("fitgenius_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      const userProfile = await api.getProfile();
      setProfile(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("fitgenius_token");
    setToken(null);
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  const updateProfile = async (data: Partial<FitnessProfile>): Promise<FitnessProfile> => {
    const updated = await api.updateProfile(data);
    setProfile(updated);
    return updated;
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchUserData();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isDarkMode,
        toggleDarkMode,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
