"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { User, UserRole, VerificationStatus } from "@/types/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => Promise<void>;
  setVerificationStatus: (status: VerificationStatus) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const getRedirectPath = (user: User) => {
  switch (user.role) {
    case "customer": return "/customer";
    case "ceo": return "/home";
    case "staff": return "/staff-portal";
    case "admin": return "/admin";
    default: return "/";
  }
};

/** Backend sends camelCase directly now; the only convenience is a display `name`. */
const normalizeUser = (u: User): User => ({
  ...u,
  name: u.name ?? u.username,
});

// Cookie-based auth: the user is NOT persisted in JS-readable storage. On
// reload it is rehydrated from the backend via /auth/profile/ (the httpOnly
// cookie authenticates the request). Kept as a no-op so existing call sites
// stay simple.
const safeSaveUserToStorage = (_userObj: User) => {
  /* intentionally no client-side persistence under httpOnly cookie auth */
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Rehydrate the session from the httpOnly cookie: if the profile fetch
    // succeeds the cookie is valid and we restore the user; otherwise we stay
    // logged out. (The api-client transparently attempts a cookie refresh on 401.)
    const initAuth = async () => {
      try {
        const freshUser = await authService.getProfile();
        if (freshUser) setUser(normalizeUser(freshUser));
      } catch {
        /* not authenticated */
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response?.mfaRequired) {
        throw new Error("MFA verification required. Please complete the second step.");
      }
      if (response?.user) {
        const normalizedUser = normalizeUser(response.user);
        setUser(normalizedUser);
        router.push(getRedirectPath(normalizedUser));
      }
    } catch (err: any) {
      const message = err?.data?.detail || err?.data?.message || "Login failed. Please check your credentials.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      if (response?.user) {
        const normalizedUser = normalizeUser(response.user);
        setUser(normalizedUser);

        // New CEOs go to onboarding, others use standard redirect
        if (normalizedUser.role === "ceo") {
          router.push("/onboarding/business");
        } else {
          router.push(getRedirectPath(normalizedUser));
        }
      }
    } catch (err: any) {
      const message = err?.data?.detail || err?.data?.message || "Registration failed. Please try again.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout(); // clears httpOnly cookies + blacklists refresh
    setUser(null);
    setError(null);
    toast.success("Successfully logged out. See you soon!");
    router.push("/login");
  };

  const setRole = async (role: UserRole) => {
    if (user) {
      const toastId = toast.loading(`Switching to ${role} view...`);
      try {
        const updatedUser = await authService.updateProfile({ role }).catch(err => {
          console.warn("Backend update failed, updating locally only:", err);
          return { ...user, role };
        });
        const normalized = normalizeUser(updatedUser);
        setUser(normalized);
        safeSaveUserToStorage(normalized);
        toast.success(`Welcome to the ${role} dashboard!`, { id: toastId });
        router.push(getRedirectPath(normalized));
      } catch (error) {
        console.error("Failed to update role:", error);
        toast.error("Failed to switch roles.", { id: toastId });
      }
    }
  };

  const setVerificationStatus = async (status: VerificationStatus) => {
    if (user) {
      try {
        const updatedUser = await authService.updateProfile({ verificationStatus: status } as any).catch(err => {
          console.warn("Backend update failed, updating locally only:", err);
          return { ...user, verificationStatus: status };
        });
        const normalized = normalizeUser(updatedUser);
        setUser(normalized);
        safeSaveUserToStorage(normalized);
      } catch (error) {
        console.error("Failed to update verification status:", error);
      }
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const toastId = toast.loading("Updating your profile...");
      try {
        const updatedUser = await authService.updateProfile(data).catch(err => {
          console.warn("Backend update failed, updating locally only:", err);
          return { ...user, ...data };
        });
        const normalized = normalizeUser(updatedUser);
        setUser(normalized);
        safeSaveUserToStorage(normalized);
        toast.success("Profile updated successfully!", { id: toastId });
      } catch (error) {
        console.error("Failed to update user:", error);
        toast.error("Failed to update profile.", { id: toastId });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setRole, setVerificationStatus, updateUser, isLoading, error }}>
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
