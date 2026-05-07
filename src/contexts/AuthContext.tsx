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

/** Normalize API user response to include both snake_case and camelCase alias fields */
const normalizeUser = (u: User): User => ({
  ...u,
  // Sync camelCase aliases from snake_case fields and vice versa
  verification_status: u.verification_status ?? (u.verificationStatus as any),
  verificationStatus: (u.verificationStatus ?? u.verification_status) as any,
  is_solo_operator: u.is_solo_operator ?? u.isSoloOperator,
  isSoloOperator: u.isSoloOperator ?? u.is_solo_operator,
  name: u.name ?? u.username,
});

const safeSaveUserToStorage = (userObj: User) => {
  try {
    const cleanUser = { ...userObj };
    if (cleanUser.avatar && cleanUser.avatar.startsWith("data:") && cleanUser.avatar.length > 200000) {
      cleanUser.avatar = "large_base64_stripped";
    }
    if ((cleanUser as any).profile) {
      const p = { ...(cleanUser as any).profile };
      if (p.avatar && p.avatar.startsWith("data:") && p.avatar.length > 200000) {
        p.avatar = "large_base64_stripped";
      }
      if (p.portfolio && Array.isArray(p.portfolio)) {
        p.portfolio = p.portfolio.map((item: any) => {
          if (item.image && item.image.startsWith("data:") && item.image.length > 100000) {
            return { ...item, image: "stripped_portfolio_image" };
          }
          return item;
        });
      }
      (cleanUser as any).profile = p;
    }
    localStorage.setItem("the-guild-user", JSON.stringify(cleanUser));
  } catch (error) {
    console.warn("Storage quota exceeded or unavailable. Retaining user in memory only:", error);
    try {
      localStorage.removeItem("the-guild-user");
    } catch {}
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user on mount and fetch fresh profile from backend
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("the-guild-user");
        if (storedUser) {
          const parsedUser = normalizeUser(JSON.parse(storedUser));
          setUser(parsedUser);
          
          // Fetch fresh profile details from backend
          const freshUser = await authService.getProfile();
          if (freshUser) {
            const normalized = normalizeUser(freshUser);
            setUser(normalized);
            safeSaveUserToStorage(normalized);
          }
        }
      } catch (err) {
        console.warn("Auth initialization failed or user not logged in:", err);
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
      if (response && response.access) {
        const normalizedUser = normalizeUser(response.user);
        setUser(normalizedUser);
        localStorage.setItem("the-guild-token", response.access);
        if (response.refresh) {
          localStorage.setItem("the-guild-refresh", response.refresh);
        }
        safeSaveUserToStorage(normalizedUser);
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
      if (response && response.access) {
        const normalizedUser = normalizeUser(response.user);
        setUser(normalizedUser);
        localStorage.setItem("the-guild-token", response.access);
        if (response.refresh) {
          localStorage.setItem("the-guild-refresh", response.refresh);
        }
        safeSaveUserToStorage(normalizedUser);
        
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

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
    localStorage.removeItem("the-guild-user");
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
        const updatedUser = await authService.updateProfile({ verification_status: status } as any).catch(err => {
          console.warn("Backend update failed, updating locally only:", err);
          return { ...user, verification_status: status, verificationStatus: status };
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
