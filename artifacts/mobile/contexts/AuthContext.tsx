import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const AUTH_KEY = "html_creator_user";

export interface User {
  id: string;
  email: string;
  username: string;
  joinDate: string;
  uploads: UploadRecord[];
}

export interface UploadRecord {
  id: string;
  filename: string;
  size: string;
  date: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addUpload: (filename: string, size: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACCOUNTS_KEY = "html_creator_accounts";

interface Account {
  email: string;
  password: string;
  username: string;
  joinDate: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_KEY);
        if (raw) setUser(JSON.parse(raw) as User);
      } catch {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const getAccounts = useCallback(async (): Promise<Account[]> => {
    try {
      const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
      return raw ? (JSON.parse(raw) as Account[]) : [];
    } catch {
      return [];
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const accounts = await getAccounts();
    const found = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    );
    if (!found) return { success: false, error: "Invalid email or password" };

    const savedUser: User = {
      id: found.email,
      email: found.email,
      username: found.username,
      joinDate: found.joinDate,
      uploads: [],
    };

    try {
      const existingRaw = await AsyncStorage.getItem(AUTH_KEY);
      if (existingRaw) {
        const existing = JSON.parse(existingRaw) as User;
        savedUser.uploads = existing.uploads || [];
      }
    } catch {}

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(savedUser));
    setUser(savedUser);
    return { success: true };
  }, [getAccounts]);

  const register = useCallback(async (email: string, password: string, username: string) => {
    if (!email || !password || !username)
      return { success: false, error: "All fields are required" };
    if (password.length < 6)
      return { success: false, error: "Password must be at least 6 characters" };

    const accounts = await getAccounts();
    if (accounts.find((a) => a.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: "Email already registered" };

    const newAccount: Account = {
      email,
      password,
      username,
      joinDate: new Date().toISOString(),
    };
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, newAccount]));

    const newUser: User = {
      id: email,
      email,
      username,
      joinDate: new Date().toISOString(),
      uploads: [],
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return { success: true };
  }, [getAccounts]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const addUpload = useCallback(async (filename: string, size: string) => {
    if (!user) return;
    const record: UploadRecord = {
      id: Date.now().toString(),
      filename,
      size,
      date: new Date().toISOString(),
    };
    const updated: User = { ...user, uploads: [record, ...user.uploads].slice(0, 10) };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, addUpload }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
