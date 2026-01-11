"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useState } from "react";
import { ChevronUp, ChevronDown, UserCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RoleSwitcher() {
    const { user, setRole, setVerificationStatus, updateUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const roles: ("ceo" | "customer" | "staff" | "admin")[] = ["ceo", "customer", "staff", "admin"];
    const statuses: ("unverified" | "pending" | "verified" | "rejected")[] = ["unverified", "pending", "verified", "rejected"];

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4"
                    >
                        <GlassCard className="p-4 border-primary/20 shadow-2xl bg-white/90 backdrop-blur-2xl w-56 space-y-4">
                            <div>
                                <p className="text-[10px] font-extrabold text-primary/40 uppercase tracking-widest mb-3 px-2">Switch Role</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {roles.map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => setRole(role)}
                                            className={`text-center px-2 py-2 rounded-lg text-[10px] font-bold transition-all ${user.role === role
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'text-primary/60 hover:bg-primary/5'
                                                }`}
                                        >
                                            {role.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-extrabold text-primary/40 uppercase tracking-widest mb-3 px-2">Verification Status</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {statuses.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setVerificationStatus(status)}
                                            className={`text-center px-2 py-2 rounded-lg text-[10px] font-bold transition-all ${user.verificationStatus === status
                                                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                                : 'text-primary/60 hover:bg-primary/5'
                                                }`}
                                        >
                                            {status.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {user.role === "ceo" && (
                                <div>
                                    <p className="text-[10px] font-extrabold text-primary/40 uppercase tracking-widest mb-3 px-2">Business Structure</p>
                                    <div className="grid grid-cols-2 gap-1">
                                        <button
                                            onClick={() => updateUser({ isSoloOperator: true })}
                                            className={`text-center px-2 py-2 rounded-lg text-[10px] font-bold transition-all ${user.isSoloOperator
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                                : 'text-primary/60 hover:bg-primary/5'
                                                }`}
                                        >
                                            SOLO
                                        </button>
                                        <button
                                            onClick={() => updateUser({ isSoloOperator: false })}
                                            className={`text-center px-2 py-2 rounded-lg text-[10px] font-bold transition-all ${!user.isSoloOperator
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                                : 'text-primary/60 hover:bg-primary/5'
                                                }`}
                                        >
                                            TEAM
                                        </button>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 w-12 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-110 transition-transform"
            >
                {isOpen ? <ChevronDown className="h-6 w-6" /> : <UserCog className="h-6 w-6" />}
            </Button>
        </div>
    );
}
