"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type UserRole = "customer" | "ceo" | "staff" | "admin";

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    verificationStatus?: "unverified" | "pending" | "verified" | "rejected";
    isSoloOperator?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, role: UserRole) => Promise<void>;
    logout: () => void;
    setRole: (role: UserRole) => void;
    setVerificationStatus: (status: "unverified" | "pending" | "verified" | "rejected") => void;
    updateUser: (data: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem("the-guild-user");
        if (storedUser) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, role: UserRole) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
            id: "1",
            name: email.split("@")[0],
            email,
            role,
            avatar: "https://github.com/shadcn.png",
            verificationStatus: role === "ceo" ? "unverified" : "verified",
            isSoloOperator: role === "ceo" ? true : false,
        };

        setUser(mockUser);
        localStorage.setItem("the-guild-user", JSON.stringify(mockUser));
        setIsLoading(false);

        if (role === "customer") {
            router.push("/");
        } else if (role === "ceo") {
            router.push("/business");
        } else {
            router.push("/dashboard/home");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("the-guild-user");
        router.push("/login");
    };

    const setRole = (role: UserRole) => {
        if (user) {
            const updatedUser = { ...user, role };
            setUser(updatedUser);
            localStorage.setItem("the-guild-user", JSON.stringify(updatedUser));
        }
    };

    const setVerificationStatus = (status: "unverified" | "pending" | "verified" | "rejected") => {
        if (user) {
            const updatedUser = { ...user, verificationStatus: status };
            setUser(updatedUser);
            localStorage.setItem("the-guild-user", JSON.stringify(updatedUser));
        }
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem("the-guild-user", JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setRole, setVerificationStatus, updateUser, isLoading }}>
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
