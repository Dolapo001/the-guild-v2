"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    User,
    Phone,
    Mail,
    MapPin,
    Camera,
    Briefcase,
    Star,
    ShieldCheck,
    Clock,
    Sparkles,
    Loader2,
    CheckCircle2,
    Building2,
    FileText,
    Calendar,
    Globe,
    CreditCard,
    Plus,
    X,
    Image as ImageIcon,
    Save,
    Edit2,
    ChevronRight,
    Search,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

// --- Sub-components ---

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-foreground/50 font-medium">{subtitle}</p>}
    </div>
);

const FormLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-extrabold text-foreground/40 uppercase tracking-widest mb-2 px-1">
        {children}
    </label>
);

const CustomSwitch = ({ checked, onChange, label, disabled }: { checked: boolean; onChange: (val: boolean) => void; label: string; disabled?: boolean }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-glass-border">
        <span className="text-sm font-bold text-foreground/70">{label}</span>
        <button
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    </div>
);

const EditableField = ({ label, value, isEditing, icon: Icon, type = "text", onChange, placeholder, className }: any) => {
    if (!isEditing) {
        return (
            <div className={cn("space-y-1", className)}>
                <FormLabel>{label}</FormLabel>
                <div className="flex items-center gap-3 px-1 py-2">
                    {Icon && <Icon className="h-4 w-4 text-primary/40" />}
                    <p className="text-sm font-bold text-foreground/80">{value || "Not set"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            <FormLabel>{label}</FormLabel>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />}
                <Input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "h-12 rounded-xl bg-white/40 dark:bg-white/5 border-glass-border focus:border-primary/50 transition-all",
                        Icon && "pl-11"
                    )}
                />
            </div>
        </div>
    );
};

// --- Views ---

const CustomerProfileView = ({ isEditing, profileData, setProfileData }: any) => {
    const [isPinpointing, setIsPinpointing] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const handlePinpoint = () => {
        setIsPinpointing(true);
        setTimeout(() => {
            setIsPinpointing(false);
            setProfileData({ ...profileData, address: "12 Admiralty Way, Lekki, Lagos" });
            setShowMap(true);
        }, 2000);
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <SectionHeader
                title="My Personal Details"
                subtitle="Manage your identity and delivery preferences."
            />

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <GlassCard className="p-6 flex flex-col items-center text-center border-primary/10">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl relative">
                                <Image
                                    src={profileData.avatar || "https://github.com/shadcn.png"}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform">
                                    <Camera className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <h3 className="mt-4 font-bold text-lg text-foreground">{profileData.name}</h3>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">Premium Member</p>
                    </GlassCard>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <EditableField
                            label="Full Name"
                            value={profileData.name}
                            isEditing={isEditing}
                            onChange={(val: string) => setProfileData({ ...profileData, name: val })}
                        />
                        <EditableField
                            label="Phone Number"
                            value={profileData.phone}
                            isEditing={isEditing}
                            onChange={(val: string) => setProfileData({ ...profileData, phone: val })}
                        />
                    </div>

                    <div className="space-y-1">
                        <FormLabel>Email Address (Read-only)</FormLabel>
                        <div className="flex items-center gap-3 px-1 py-2 opacity-60">
                            <Mail className="h-4 w-4 text-foreground/30" />
                            <p className="text-sm font-bold text-foreground/80">{profileData.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-glass-border">
                        <div className="flex items-center justify-between">
                            <FormLabel>Default Delivery Address</FormLabel>
                            {isEditing && (
                                <Button
                                    onClick={handlePinpoint}
                                    disabled={isPinpointing}
                                    variant="ghost"
                                    className="h-auto p-0 text-xs font-bold text-primary hover:bg-transparent flex items-center gap-1"
                                >
                                    {isPinpointing ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                                    Pinpoint Me
                                </Button>
                            )}
                        </div>

                        {isEditing ? (
                            <Input
                                placeholder="Enter your address..."
                                value={profileData.address}
                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                className="h-12 rounded-xl bg-white/40 dark:bg-white/5 border-glass-border focus:border-primary/50"
                            />
                        ) : (
                            <p className="text-sm font-bold text-foreground/80 px-1">{profileData.address || "No address set"}</p>
                        )}

                        <AnimatePresence>
                            {isPinpointing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse"
                                >
                                    <Loader2 className="h-3 w-3 animate-spin" /> Getting GPS...
                                </motion.div>
                            )}
                            {showMap && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative h-40 w-full rounded-2xl overflow-hidden border border-glass-border shadow-inner"
                                >
                                    <Image
                                        src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop"
                                        alt="Map Preview"
                                        fill
                                        className="object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-primary p-2 rounded-full shadow-lg animate-bounce">
                                            <MapPin className="h-6 w-6 text-secondary" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StaffProfileView = ({ isEditing, profileData, setProfileData }: any) => {
    const [newSkill, setNewSkill] = useState("");

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            if (!profileData.skills.includes(newSkill.trim())) {
                setProfileData({ ...profileData, skills: [...profileData.skills, newSkill.trim()] });
            }
            setNewSkill("");
        }
    };

    const removeSkill = (skill: string) => {
        setProfileData({ ...profileData, skills: profileData.skills.filter((s: string) => s !== skill) });
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <SectionHeader
                title="My Professional Card"
                subtitle="Showcase your skills and manage your availability."
            />

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1 space-y-6">
                    <GlassCard className="p-6 flex flex-col items-center text-center border-primary/10">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg relative mb-4">
                                <Image
                                    src={profileData.avatar || "https://github.com/shadcn.png"}
                                    alt="Staff"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {isEditing && (
                                <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                                    <Camera className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-foreground">{profileData.name}</h3>
                        <div className="flex items-center gap-1.5 mt-3 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                            <Sparkles className="h-3 w-3 text-secondary fill-secondary" />
                            <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest">Maestro Elite</span>
                        </div>
                    </GlassCard>

                    <div className="space-y-4">
                        <CustomSwitch
                            label="Accept Instant Bookings"
                            checked={profileData.acceptInstant}
                            onChange={(val) => setProfileData({ ...profileData, acceptInstant: val })}
                            disabled={!isEditing}
                        />
                        <CustomSwitch
                            label="Enable Maestro Auto-Assign"
                            checked={profileData.maestroAutoAssign}
                            onChange={(val) => setProfileData({ ...profileData, maestroAutoAssign: val })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <EditableField
                            label="Job Title"
                            value={profileData.jobTitle}
                            isEditing={isEditing}
                            icon={Briefcase}
                            onChange={(val: string) => setProfileData({ ...profileData, jobTitle: val })}
                        />
                        <EditableField
                            label="Years of Experience"
                            value={profileData.experience}
                            isEditing={isEditing}
                            type="number"
                            icon={Clock}
                            onChange={(val: string) => setProfileData({ ...profileData, experience: val })}
                        />
                    </div>

                    <div className="space-y-2">
                        <FormLabel>Professional Bio</FormLabel>
                        {isEditing ? (
                            <Textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                className="min-h-[120px] rounded-xl bg-white/40 dark:bg-white/5 border-glass-border focus:border-primary/50"
                            />
                        ) : (
                            <p className="text-sm font-medium text-foreground/60 leading-relaxed px-1">{profileData.bio}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <FormLabel>Skills & Specializations</FormLabel>
                        <div className="flex flex-wrap gap-2">
                            {profileData.skills.map((skill: string) => (
                                <span key={skill} className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs font-bold text-primary flex items-center gap-2">
                                    {skill}
                                    {isEditing && (
                                        <button onClick={() => removeSkill(skill)} className="text-primary/40 hover:text-red-500 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </span>
                            ))}
                            {isEditing && (
                                <div className="relative">
                                    <Input
                                        placeholder="Type + Enter"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={addSkill}
                                        className="h-8 w-32 text-xs rounded-lg bg-white/40 dark:bg-white/5 border-glass-border focus:border-primary/50"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BusinessProfileView = ({ isEditing, profileData, setProfileData }: any) => {
    const [isFetchingAccount, setIsFetchingAccount] = useState(false);
    const [newTag, setNewTag] = useState("");

    const handleAccountNumberChange = (val: string) => {
        setProfileData({ ...profileData, accountNumber: val });
        if (val.length === 10) {
            setIsFetchingAccount(true);
            setTimeout(() => {
                setIsFetchingAccount(false);
                setProfileData((prev: any) => ({ ...prev, accountName: "Glow Spa Ventures Ltd" }));
            }, 1000);
        } else {
            setProfileData((prev: any) => ({ ...prev, accountName: "" }));
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            if (!profileData.serviceTags.includes(newTag.trim())) {
                setProfileData({ ...profileData, serviceTags: [...profileData.serviceTags, newTag.trim()] });
            }
            setNewTag("");
        }
    };

    const removeTag = (tag: string) => {
        setProfileData({ ...profileData, serviceTags: profileData.serviceTags.filter((t: string) => t !== tag) });
    };

    const toggleDay = (dayIndex: number) => {
        const newSchedule = [...profileData.schedule];
        newSchedule[dayIndex].isClosed = !newSchedule[dayIndex].isClosed;
        setProfileData({ ...profileData, schedule: newSchedule });
    };

    const updateTime = (dayIndex: number, field: 'open' | 'close', value: string) => {
        const newSchedule = [...profileData.schedule];
        newSchedule[dayIndex][field] = value;
        setProfileData({ ...profileData, schedule: newSchedule });
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <SectionHeader
                title="Business Profile"
                subtitle="Manage your business identity and verification status."
            />

            {/* Header Section: Banner + Logo */}
            <div className="relative h-56 w-full rounded-3xl overflow-hidden border border-glass-border group">
                <Image
                    src={profileData.banner || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop"}
                    alt="Banner"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" className="rounded-full bg-white/90 backdrop-blur-md text-primary font-bold">
                            <ImageIcon className="h-4 w-4 mr-2" /> Change Banner
                        </Button>
                    </div>
                )}

                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="relative">
                        <div className="h-32 w-32 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden">
                            <Image
                                src={profileData.logo || "https://github.com/shadcn.png"}
                                alt="Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {isEditing && (
                            <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                                <Camera className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <div className="pb-14">
                        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">{profileData.businessName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-accent text-white border-0 px-3 py-1 text-[10px] font-bold shadow-lg">
                                <ShieldCheck className="h-3 w-3 mr-1.5" /> VERIFIED BUSINESS
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-20 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                    {/* Section A: Business Identity */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-glass-border pb-4">
                            <h3 className="text-sm font-extrabold text-foreground/30 uppercase tracking-widest">Business Identity</h3>
                            <Sparkles className="h-4 w-4 text-primary/20" />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <EditableField
                                label="Business Name"
                                value={profileData.businessName}
                                isEditing={isEditing}
                                icon={Building2}
                                onChange={(val: string) => setProfileData({ ...profileData, businessName: val })}
                            />
                            <EditableField
                                label="Tagline"
                                value={profileData.tagline}
                                isEditing={isEditing}
                                icon={Sparkles}
                                onChange={(val: string) => setProfileData({ ...profileData, tagline: val })}
                            />
                            <EditableField
                                label="Business Phone"
                                value={profileData.phone}
                                isEditing={isEditing}
                                icon={Phone}
                                onChange={(val: string) => setProfileData({ ...profileData, phone: val })}
                            />
                            <EditableField
                                label="Business Email"
                                value={profileData.email}
                                isEditing={isEditing}
                                icon={Mail}
                                onChange={(val: string) => setProfileData({ ...profileData, email: val })}
                            />
                            <EditableField
                                label="Website URL"
                                value={profileData.website}
                                isEditing={isEditing}
                                icon={Globe}
                                onChange={(val: string) => setProfileData({ ...profileData, website: val })}
                            />
                            <div className="space-y-1">
                                <FormLabel>CAC Registration Number</FormLabel>
                                <div className="flex items-center gap-2 px-1 py-2">
                                    <p className="text-sm font-bold text-foreground/40">{profileData.cacNumber}</p>
                                    <CheckCircle2 className="h-4 w-4 text-accent" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-glass-border">
                            <FormLabel>Service Tags (Maestro Matching)</FormLabel>
                            <div className="flex flex-wrap gap-2">
                                {profileData.serviceTags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary flex items-center gap-2 uppercase tracking-wider">
                                        {tag}
                                        {isEditing && (
                                            <button onClick={() => removeTag(tag)} className="text-secondary/40 hover:text-red-500 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {isEditing && (
                                    <div className="relative">
                                        <Input
                                            placeholder="+ Add Tag"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={addTag}
                                            className="h-8 w-32 text-[10px] font-bold rounded-lg bg-white/40 dark:bg-white/5 border-glass-border focus:border-primary/50"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Section B: Operating Hours Scheduler */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-glass-border pb-4">
                            <h3 className="text-sm font-extrabold text-foreground/30 uppercase tracking-widest">Operating Hours</h3>
                            <Clock className="h-4 w-4 text-primary/20" />
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                {profileData.schedule.map((item: any, idx: number) => (
                                    <div key={item.day} className="flex items-center gap-4 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-glass-border">
                                        <div className="w-24 shrink-0">
                                            <p className="text-sm font-bold text-foreground/70">{item.day}</p>
                                        </div>
                                        <div className="flex-1 flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleDay(idx)}
                                                    className={cn(
                                                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                                                        !item.isClosed ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                                                    )}
                                                >
                                                    <span className={cn("inline-block h-3 w-3 transform rounded-full bg-white transition-transform", !item.isClosed ? "translate-x-5" : "translate-x-1")} />
                                                </button>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                                                    {item.isClosed ? "Closed" : "Open"}
                                                </span>
                                            </div>

                                            <div className={cn("flex items-center gap-2 flex-1 transition-opacity", item.isClosed && "opacity-30 pointer-events-none")}>
                                                <input
                                                    type="time"
                                                    value={item.open}
                                                    onChange={(e) => updateTime(idx, 'open', e.target.value)}
                                                    className="bg-transparent border-b border-glass-border text-xs font-bold text-primary outline-none focus:border-primary"
                                                />
                                                <span className="text-[10px] font-bold text-foreground/20">to</span>
                                                <input
                                                    type="time"
                                                    value={item.close}
                                                    onChange={(e) => updateTime(idx, 'close', e.target.value)}
                                                    className="bg-transparent border-b border-glass-border text-xs font-bold text-primary outline-none focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {profileData.schedule.map((item: any) => (
                                    <div key={item.day} className="flex items-center justify-between p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-glass-border">
                                        <span className="text-xs font-bold text-foreground/60">{item.day}</span>
                                        {item.isClosed ? (
                                            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Closed</span>
                                        ) : (
                                            <span className="text-xs font-mono font-bold text-primary">{item.open} - {item.close}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-8">
                    {/* Section C: Payout Configuration */}
                    <GlassCard className="p-8 space-y-6 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                        <div className="flex items-center justify-between border-b border-accent/10 pb-4">
                            <h3 className="text-sm font-extrabold text-accent uppercase tracking-widest">Payout Settings</h3>
                            <CreditCard className="h-4 w-4 text-accent/40" />
                        </div>
                        <p className="text-[10px] font-bold text-accent/60 italic">Visible to Admin Only</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <FormLabel>Bank Name</FormLabel>
                                {isEditing ? (
                                    <select
                                        value={profileData.bankName}
                                        onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                                        className="w-full h-12 rounded-xl bg-white/40 dark:bg-white/5 border-glass-border px-4 text-sm font-bold text-foreground focus:border-primary/50 outline-none"
                                    >
                                        <option value="Access Bank">Access Bank</option>
                                        <option value="GTBank">GTBank</option>
                                        <option value="Zenith Bank">Zenith Bank</option>
                                        <option value="First Bank">First Bank</option>
                                        <option value="Kuda Bank">Kuda Bank</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-3 px-1 py-2">
                                        <Building2 className="h-4 w-4 text-accent/40" />
                                        <p className="text-sm font-bold text-foreground/80">{profileData.bankName}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <FormLabel>Account Number</FormLabel>
                                {isEditing ? (
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                                        <Input
                                            value={profileData.accountNumber}
                                            maxLength={10}
                                            onChange={(e) => handleAccountNumberChange(e.target.value)}
                                            className="pl-11 h-12 rounded-xl bg-white/40 dark:bg-white/5 border-glass-border focus:border-primary/50"
                                        />
                                        {isFetchingAccount && (
                                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent animate-spin" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 px-1 py-2">
                                        <CreditCard className="h-4 w-4 text-accent/40" />
                                        <p className="text-sm font-mono font-bold text-foreground/80">
                                            ****{profileData.accountNumber.slice(-4)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {profileData.accountName && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-1"
                                    >
                                        <FormLabel>Account Name</FormLabel>
                                        <div className="flex items-center gap-2 px-1 py-2 bg-accent/5 rounded-lg border border-accent/10">
                                            <CheckCircle2 className="h-3 w-3 text-accent" />
                                            <p className="text-xs font-bold text-accent">{profileData.accountName}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 border-white/40">
                        <h3 className="text-xl font-extrabold text-primary mb-6">Profile Completion</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-extrabold text-primary">{profileData.completion}%</span>
                                <span className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Completed</span>
                            </div>
                            <div className="h-2.5 w-full bg-primary/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "85%" }}
                                    animate={{ width: `${profileData.completion}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-primary rounded-full"
                                />
                            </div>
                            <p className="text-xs font-bold text-foreground/40 pt-2 leading-relaxed">
                                {profileData.completion === 100 ? "Your profile is fully optimized for Maestro matching!" : "Complete your payout details to reach 100%."}
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

const Badge = ({ children, className }: any) => (
    <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold", className)}>
        {children}
    </span>
);

export default function ProfilePage() {
    const { user } = useAuth();
    const currentRole = user?.role || "customer";
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || "Adedolapo",
        email: user?.email || "adedolapo@theguild.ng",
        phone: "+234 801 234 5678",
        avatar: user?.avatar || "https://github.com/shadcn.png",
        address: "12 Admiralty Way, Lekki, Lagos",
        completion: 85,
        // Staff fields
        jobTitle: "Senior Wellness Specialist",
        experience: "5",
        bio: "Passionate about delivering premium wellness experiences. Specialized in deep tissue and sports therapy with over 5 years of experience in luxury spas.",
        skills: ["Deep Tissue", "Swedish", "Aromatherapy", "Hot Stone"],
        acceptInstant: true,
        maestroAutoAssign: true,
        // Business fields
        businessName: "Glow Spa Lekki",
        tagline: "Premium Wellness & Beauty in the Heart of Lagos",
        website: "www.glowspa.ng",
        cacNumber: "RC-982341",
        category: "Spa & Wellness",
        serviceTags: ["Spa", "Massage", "Skincare", "Wellness"],
        bankName: "Access Bank",
        accountNumber: "0123456789",
        accountName: "Glow Spa Ventures Ltd",
        banner: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop",
        logo: "https://github.com/shadcn.png",
        schedule: [
            { day: 'Monday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Tuesday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Wednesday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Thursday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Friday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Saturday', open: '10:00', close: '16:00', isClosed: false },
            { day: 'Sunday', open: '12:00', close: '16:00', isClosed: true },
        ]
    });

    const handleSave = () => {
        setIsSaving(true);
        // Mock API call
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            setProfileData(prev => ({ ...prev, completion: 100 }));
            showToast(currentRole === 'ceo' ? "Business hours and payout details updated ✅" : "Profile updated successfully ✅");
        }, 1500);
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="pb-24">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Profile</h1>
                    </div>
                    <p className="text-foreground/50 font-medium text-lg">
                        Manage your account settings and preferences.
                    </p>
                </motion.div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                className="h-11 px-6 rounded-xl border-glass-border font-bold text-foreground/60 hover:bg-muted"
                            >
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-11 px-8 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="h-11 px-8 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
                        >
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentRole}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentRole === "customer" && (
                        <CustomerProfileView
                            isEditing={isEditing}
                            profileData={profileData}
                            setProfileData={setProfileData}
                        />
                    )}
                    {currentRole === "staff" && (
                        <StaffProfileView
                            isEditing={isEditing}
                            profileData={profileData}
                            setProfileData={setProfileData}
                        />
                    )}
                    {(currentRole === "ceo" || currentRole === "admin") && (
                        <BusinessProfileView
                            isEditing={isEditing}
                            profileData={profileData}
                            setProfileData={setProfileData}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-10 left-1/2 z-[200] px-8 py-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10 flex items-center gap-3"
                    >
                        <span className="font-bold text-sm">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
