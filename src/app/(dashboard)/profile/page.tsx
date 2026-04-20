"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { api } from "@/lib/api-client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AlertCircle,
  Rocket,
  Users,
  Check,
  ShieldAlert,
  AlertTriangle,
  Wallet as WalletIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { staffService } from "@/services/staff.service";
import { walletService } from "@/services/wallet.service";
import { maestroService } from "@/services/maestro.service";
import Link from "next/link";
import { toast } from "sonner";

// --- Sub-components ---

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
    {subtitle && <p className="text-foreground/50 font-medium">{subtitle}</p>}
  </div>
);

const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={cn("block text-xs font-extrabold text-foreground/40 uppercase tracking-widest mb-2 px-1", className)}>
    {children}
  </label>
);

const CustomSwitch = ({ checked, onChange, label, disabled }: { checked: boolean; onChange: (val: boolean) => void; label: string; disabled?: boolean }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-glass-border">
    <span className="text-sm font-bold text-foreground/70">{label}</span>
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        checked ? "bg-primary" : "bg-gray-200 ",
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
            "h-12 rounded-xl bg-white/40 border-glass-border focus:border-primary/50 transition-all",
            Icon && "pl-11"
          )}
        />
      </div>
    </div>
  );
};

// --- Views ---

const CustomerProfileView = ({ isEditing, setIsEditing, profileData, setProfileData }: any) => {
  const { user } = useAuth();
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
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl relative">
                <Image
                  src={profileData.avatar || "https://github.com/shadcn.png"}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5" />
                </button>
              )}
            </div>
            <h3 className="mt-4 font-bold text-lg text-foreground">{profileData.name}</h3>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">{user?.role || "Member"}</p>
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
                className="h-12 rounded-xl bg-white/40 border-glass-border focus:border-primary/50"
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

const StaffProfileView = ({ isEditing, setIsEditing, profileData, setProfileData }: any) => {
  const { user } = useAuth();
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
                <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white ">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <h3 className="font-bold text-lg text-foreground">{profileData.name}</h3>
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
              <Sparkles className="h-3 w-3 text-secondary fill-secondary" />
              <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest">{profileData.jobTitle || "Professional"}</span>
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
                className="min-h-[120px] rounded-xl bg-white/40 border-glass-border focus:border-primary/50"
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
                    className="h-8 w-32 text-xs rounded-lg bg-white/40 border-glass-border focus:border-primary/50"
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

const BusinessProfileView = ({ isEditing, setIsEditing, profileData, setProfileData }: any) => {
  const { user, updateUser } = useAuth();
  const [isFetchingAccount, setIsFetchingAccount] = useState(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [scaleError, setScaleError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [staffCount, setStaffCount] = useState(0);
  const [banks, setBanks] = useState<any[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", duration_minutes: 60, description: "" });
  const [newPortfolio, setNewPortfolio] = useState({ title: "", description: "", image: null as File | null });
  const [portfolioPreview, setPortfolioPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staff, bankList] = await Promise.all([
          staffService.getStaffList(),
          walletService.getBanks()
        ]);
        setStaffCount(staff.length);
        setBanks(bankList);
      } catch (err) {
        console.error("Failed to fetch business data:", err);
      }
    };
    fetchData();
  }, []);

  const isSolo = user?.isSoloOperator ?? true;

  const handleAccountNumberChange = (val: string) => {
    setProfileData({ ...profileData, accountNumber: val });
    if (val.length === 10) {
      setIsFetchingAccount(true);
      setTimeout(() => {
        setIsFetchingAccount(false);
        setProfileData((prev: any) => ({ ...prev, accountName: "Verified Merchant Account" }));
      }, 1000);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price) return;
    const toastId = toast.loading("Adding service to catalog...");
    setIsAdding(true);
    try {
      const bizUid = (user as any).businesses?.[0]?.uid || (user as any).profile?.business?.uid;
      if (!bizUid) throw new Error("No business found for this account.");
      
      const savedService = await maestroService.addService(bizUid, newService);
      setProfileData({ ...profileData, services: [...(profileData.services || []), savedService] });
      setIsServiceModalOpen(false);
      setNewService({ name: "", price: "", duration_minutes: 60, description: "" });
      toast.success("Service added successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Failed to add service:", err);
      toast.error(err?.message || "Error adding service. Please ensure you are a registered CEO.", { id: toastId });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolio.image) return;
    const toastId = toast.loading("Publishing work to portfolio...");
    setIsAdding(true);
    try {
      const bizUid = (user as any).businesses?.[0]?.uid || (user as any).profile?.business?.uid;
      if (!bizUid) throw new Error("No business found.");
      
      const formData = new FormData();
      formData.append('image', newPortfolio.image);
      if (newPortfolio.title) formData.append('title', newPortfolio.title);
      if (newPortfolio.description) formData.append('description', newPortfolio.description);
      
      const savedEntry = await maestroService.addPortfolioEntry(bizUid, formData);
      setProfileData({ ...profileData, portfolio: [...(profileData.portfolio || []), savedEntry] });
      setIsPortfolioModalOpen(false);
      setNewPortfolio({ title: "", description: "", image: null });
      setPortfolioPreview(null);
      toast.success("Work published successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Failed to add portfolio:", err);
      toast.error(err?.message || "Failed to add portfolio work.", { id: toastId });
    } finally {
      setIsAdding(false);
    }
  };

  const handleScaleUp = () => {
    updateUser({ isSoloOperator: false });
    setIsScaleModalOpen(false);
    toast.success("Dashboard upgraded! Welcome to Team Mode.");
  };

  const handleRevertToSolo = () => {
    if (staffCount > 0) {
      setScaleError("You cannot switch to Solo Mode while you have active staff profiles. Please archive them first.");
      toast.error("Archive staff members first!");
      return;
    }
    updateUser({ isSoloOperator: true });
    setIsRevertModalOpen(false);
    toast.success("Dashboard updated! Reverted to Solo Mode.");
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
    <div className="space-y-12 max-w-6xl">
      <SectionHeader
        title="Business Profile & Operations"
        subtitle="Manage your public identity, verification, and scaling settings."
      />

      {/* Header Section: Banner + Logo */}
      <div className="relative h-48 md:h-80 w-full rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-100 group shadow-premium">
        <div className="absolute inset-0 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden z-0">
          <Image
            src={profileData.banner || "https://images.unsplash.com/photo-1519415510236-85591bf59386?q=80&w=1200&auto=format&fit=crop"}
            alt="Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500" />
        </div>
        
        {isEditing && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
            <Button 
              variant="secondary" 
              className="rounded-full bg-white/90 backdrop-blur-md text-primary font-bold shadow-xl scale-75 md:scale-100"
              onClick={() => toast.info("Feature coming soon: Dynamic Banner Upload.")}
            >
              <ImageIcon className="h-4 w-4 mr-2" /> Change Banner
            </Button>
          </div>
        )}

        <div className="absolute -bottom-1 left-0 right-0 md:left-12 md:right-auto flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-10 z-10 pointer-events-none">
          <div className="relative translate-y-1/2 pointer-events-auto">
            <div className="h-32 w-32 md:h-44 md:w-44 rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-2 md:p-4 border-[4px] md:border-[6px] border-white shadow-2xl relative overflow-hidden group/logo">
              <Image
                src={profileData.logo || "/placeholder-logo.png"}
                alt="Logo"
                fill
                className="object-contain p-2 md:p-4"
              />
              {isEditing && (
                <button 
                  onClick={() => toast.info("Feature coming soon: Dynamic Logo Upload.")}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer border-none outline-none w-full h-full"
                >
                  <Camera className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </button>
              )}
            </div>
          </div>
          <div className="pb-4 md:pb-8 pointer-events-auto text-center md:text-left px-4 md:px-0">
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl md:text-5xl font-black text-white drop-shadow-2xl tracking-tighter"
            >
              {profileData.businessName || "Unnamed Business"}
            </motion.h2>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2 md:mt-3">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 px-3 py-1 md:px-4 md:py-2 text-[8px] md:text-[10px] font-black shadow-lg tracking-widest uppercase">
                {profileData.tagline || "Verified Guild Merchant"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-40 md:mt-32 grid gap-10 lg:grid-cols-3 relative z-20">
        <div className="lg:col-span-2 space-y-12">
          {/* Marketplace Showcase: Services & Portfolio */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-primary tracking-tight uppercase">Showcase & Catalog</h3>
              <div className="h-px flex-1 bg-primary/10 mx-6" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <GlassCard className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <FormLabel>Active Services</FormLabel>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] font-black text-primary uppercase"
                    disabled={user?.verificationStatus !== 'verified'}
                    onClick={() => setIsServiceModalOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Service
                  </Button>
                </div>
                <div className="space-y-3">
                  {profileData.services?.length > 0 ? (
                    profileData.services.map((s: any) => (
                      <div key={s.uid} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-glass-border hover:border-primary/20 transition-all">
                        <div>
                          <p className="text-sm font-black text-primary">{s.name}</p>
                          <p className="text-[10px] font-bold text-foreground/40">{s.duration_minutes} MINS</p>
                        </div>
                        <p className="text-sm font-black text-primary">₦{Number(s.price).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-primary/5 rounded-2xl border border-dashed border-primary/20">
                      <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">No services listed yet</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <FormLabel>Portfolio Gallery</FormLabel>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] font-black text-primary uppercase"
                      disabled={user?.verificationStatus !== 'verified'}
                      onClick={() => setIsPortfolioModalOpen(true)}
                    >
                      <ImageIcon className="h-3 w-3 mr-1" /> Manage
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {profileData.portfolio?.length > 0 ? (
                    profileData.portfolio.slice(0, 4).map((entry: any) => (
                      <div key={entry.uid} className="relative aspect-square rounded-xl overflow-hidden group/item">
                        <Image src={entry.image} alt={entry.title || "Portfolio Work"} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                          <Edit2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 text-center bg-secondary/5 rounded-2xl border border-dashed border-secondary/20">
                      <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Add pictures of your work</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-[10px] font-black text-secondary uppercase"
                        onClick={() => setIsPortfolioModalOpen(true)}
                      >
                        <Camera className="h-3 w-3 mr-1" /> Upload Work
                      </Button>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Business Identity */}
          <GlassCard id="verification-section" className="p-10 space-y-8 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-glass-border pb-6">
              <h3 className="text-sm font-extrabold text-foreground/30 uppercase tracking-widest">Identity & SEO</h3>
              <Search className="h-5 w-5 text-primary/20" />
            </div>

            {/* Verification Status Alert */}
            {user?.verificationStatus !== 'verified' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex flex-col md:flex-row items-center gap-6"
              >
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-8 w-8 text-amber-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-black text-amber-600 uppercase tracking-tight">CAC Verification Pending</h4>
                  <p className="text-xs font-bold text-foreground/40 mt-1">Provide your CAC RC Number to unlock escrow and full visibility.</p>
                </div>
                {!isEditing && (
                  <Link href="/verification">
                    <Button 
                      variant="outline"
                      className="h-12 px-8 border-amber-600/20 text-amber-600 font-black rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-lg shadow-amber-600/5 whitespace-nowrap"
                    >
                      Verify Now
                    </Button>
                  </Link>
                )}
              </motion.div>
            )}
            <div className="grid gap-8 sm:grid-cols-2">
              <EditableField
                label="Business Name"
                value={profileData.businessName}
                isEditing={isEditing}
                icon={Building2}
                onChange={(val: string) => setProfileData({ ...profileData, businessName: val })}
              />
              <EditableField
                label="Public Tagline"
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
                label="Support Email"
                value={profileData.email}
                isEditing={isEditing}
                icon={Mail}
                onChange={(val: string) => setProfileData({ ...profileData, email: val })}
              />
            </div>

            <div className="space-y-4 pt-6 border-t border-glass-border">
              <FormLabel>AI & Marketplace Tags</FormLabel>
              <div className="flex flex-wrap gap-2">
                {profileData.serviceTags.map((tag: string) => (
                  <span key={tag} className="px-5 py-2.5 rounded-2xl bg-primary/5 border border-primary/10 text-[10px] font-black text-primary flex items-center gap-3 uppercase tracking-tighter shadow-sm hover:scale-105 transition-transform">
                    {tag}
                    {isEditing && (
                      <button onClick={() => removeTag(tag)} className="text-primary/40 hover:text-red-500 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <Input
                    placeholder="+ Add Search Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        if (!profileData.serviceTags.includes(newTag.trim())) {
                          setProfileData({ ...profileData, serviceTags: [...profileData.serviceTags, newTag.trim()] });
                        }
                        setNewTag("");
                      }
                    }}
                    className="h-10 w-40 text-xs font-bold rounded-2xl bg-white/40 border-glass-border focus:border-primary/50"
                  />
                )}
              </div>
            </div>
          </GlassCard>

          {/* Operating Hours */}
          <GlassCard className="p-10 space-y-8">
            <div className="flex items-center justify-between border-b border-glass-border pb-6">
              <h3 className="text-sm font-extrabold text-foreground/30 uppercase tracking-widest">Operating Schedule</h3>
              <Clock className="h-5 w-5 text-primary/20" />
            </div>

            <div className="grid gap-4">
              {profileData.schedule.map((item: any, idx: number) => (
                <div key={item.day} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 rounded-[1.5rem] md:rounded-[2rem] bg-white/40 border border-glass-border hover:border-primary/20 transition-colors group">
                  <div className="w-full sm:w-28 shrink-0">
                    <p className="text-sm font-black text-foreground/70 tracking-tight">{item.day}</p>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDay(idx)}
                        disabled={!isEditing}
                        className={cn(
                          "relative inline-flex h-8 w-14 items-center rounded-full transition-all",
                          !item.isClosed ? "bg-primary shadow-xl shadow-primary/30" : "bg-slate-200 ",
                          !isEditing && "opacity-50"
                        )}
                      >
                        <span className={cn("inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md", !item.isClosed ? "translate-x-7" : "translate-x-1")} />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 min-w-[50px]">
                        {item.isClosed ? "OFFLINE" : "ACTIVE"}
                      </span>
                    </div>

                    {!item.isClosed && (
                      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                        <input
                          type="time"
                          value={item.open}
                          disabled={!isEditing}
                          onChange={(e) => updateTime(idx, 'open', e.target.value)}
                          className="bg-primary/5 border-0 rounded-lg px-3 py-2 text-sm font-black text-primary focus:ring-2 ring-primary/20 outline-none transition-all"
                        />
                        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">TO</span>
                        <input
                          type="time"
                          value={item.close}
                          disabled={!isEditing}
                          onChange={(e) => updateTime(idx, 'close', e.target.value)}
                          className="bg-primary/5 border-0 rounded-lg px-3 py-2 text-sm font-black text-primary focus:ring-2 ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Operations & Scaling Section */}
          <GlassCard className="p-10 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-40 transition-opacity duration-700">
              <Rocket className="h-32 w-32 text-primary" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h3 className="text-2xl font-black text-primary">Operations & Scaling</h3>
                  <Badge className={cn(
                    "px-4 py-1.5 font-bold rounded-full border tracking-[0.2em] uppercase text-[9px]",
                    isSolo ? "bg-slate-500/10 text-slate-500 border-slate-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  )}>
                    {isSolo ? "SOLO MODE" : "TEAM MODE"}
                  </Badge>
                </div>
                <p className="text-foreground/50 font-bold text-lg leading-relaxed max-w-sm">
                  {isSolo 
                    ? "Currently optimized for independent professionals. Simplified dashboard for personal sessions."
                    : "Full agency features active: Workforce management, payroll, and distributed operations enabled."}
                </p>
              </div>
              <div className="shrink-0">
                {isSolo ? (
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      onClick={() => setIsScaleModalOpen(true)}
                      disabled={user?.verificationStatus !== 'verified'}
                      className="h-16 px-10 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 transition-all duration-500 hover:bg-transparent hover:text-primary hover:border-2 hover:border-primary hover:scale-105 active:scale-95 flex items-center gap-2 group disabled:opacity-50 disabled:grayscale"
                    >
                      <Rocket className="h-6 w-6 group-hover:animate-bounce" /> Upgrade to Team Mode
                    </Button>
                    {user?.verificationStatus !== 'verified' && (
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest animate-pulse">Verification Required</p>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsRevertModalOpen(true)}
                    variant="outline"
                    className="h-14 px-8 border-glass-border text-primary font-bold rounded-2xl hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 transition-all"
                  >
                    Switch to Solo Mode
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-10">
          {/* Payout Configuration */}
          <GlassCard className="p-10 space-y-8 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between border-b border-accent/10 pb-6">
              <h3 className="text-sm font-extrabold text-accent uppercase tracking-widest">Financial Nexus</h3>
              <CreditCard className="h-5 w-5 text-accent/40" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <FormLabel>Payout Destination</FormLabel>
                {isEditing ? (
                  <div className="relative group">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 group-focus-within:text-accent transition-colors" />
                    <select
                      value={profileData.bankName}
                      onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                      className="w-full h-16 rounded-[2rem] bg-white/40 border-glass-border pl-14 pr-5 text-sm font-black text-foreground focus:border-accent focus:ring-0 outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Select Bank...</option>
                      {banks.map(bank => (
                        <option key={bank.uid} value={bank.name}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-6 py-4 bg-accent/5 rounded-3xl border border-accent/10">
                    <Building2 className="h-6 w-6 text-accent" />
                    <p className="text-sm font-black text-foreground">{profileData.bankName || "No Bank Linked"}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <FormLabel>Unified Account Number</FormLabel>
                {isEditing ? (
                  <div className="relative group">
                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 group-focus-within:text-accent transition-colors" />
                    <Input
                      value={profileData.accountNumber}
                      maxLength={10}
                      onChange={(e) => handleAccountNumberChange(e.target.value)}
                      className="pl-14 h-16 rounded-[2rem] bg-white/40 border-glass-border focus:border-accent font-black text-lg"
                    />
                    {isFetchingAccount && (
                      <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-accent animate-spin" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-6 py-4 bg-accent/5 rounded-3xl border border-accent/10">
                    <CreditCard className="h-6 w-6 text-accent" />
                    <p className="text-sm font-mono font-black tracking-widest text-foreground">
                      {profileData.accountNumber ? `**** **** ${profileData.accountNumber.slice(-4)}` : "Not Provided"}
                    </p>
                  </div>
                )}
              </div>

              {profileData.accountName && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-3xl bg-accent text-white shadow-2xl shadow-accent/20"
                >
                  <FormLabel className="text-white/60 mb-2">Verified Merchant Entity</FormLabel>
                  <p className="text-lg font-black uppercase tracking-tight">{profileData.accountName}</p>
                  <div className="flex justify-between items-center mt-4">
                    <Badge className="bg-white/20 text-white font-black text-[9px] uppercase px-3 py-1 border-0">CAC Linked</Badge>
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>

          {/* Profile Completion */}
          <GlassCard className="p-10 border-white/40 shadow-premium group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-primary tracking-tight">System Health</h3>
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <ShieldCheck className="h-6 w-6 text-primary/40" />
              </motion.div>
            </div>
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <span className="text-5xl font-black text-primary leading-none">{profileData.completion}%</span>
                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mb-1">Guild Standing</span>
              </div>
              <div className="h-4 w-full bg-primary/5 rounded-full overflow-hidden p-1 border border-primary/10">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${profileData.completion}%` }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                />
              </div>
              <p className="text-xs font-bold text-foreground/40 leading-relaxed text-center px-4 italic">
                {profileData.completion === 100 
                  ? "Maximum visibility achieved. Maestro is prioritizing your placements." 
                  : "Optimize your business identity to reach full market capacity."}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Scale Up Modal */}
      <Dialog open={isScaleModalOpen} onOpenChange={setIsScaleModalOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <GlassCard className="border-white/40 shadow-2xl p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-extrabold text-primary text-center">
                Scale Your Operations
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <p className="text-center text-foreground/60 font-medium">
                Switching to Team Mode unlocks industrial-grade tools for business growth.
              </p>

              <div className="grid gap-4">
                {[
                  { title: "Staff Clusters", desc: "Manage any number of field professionals.", icon: Users },
                  { title: "Smart Delegation", desc: "AI-assisted job matching and dispatch.", icon: Check },
                  { title: "Integrated Payroll", desc: "Automated commission and salary payouts.", icon: WalletIcon },
                  { title: "Verification Guard", desc: "Enterprise-level quality assurance.", icon: ShieldAlert },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">{benefit.title}</h4>
                      <p className="text-sm text-foreground/50 font-medium">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleScaleUp}
                className="h-16 w-full bg-primary text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-102 transition-transform"
              >
                Activate Team Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsScaleModalOpen(false)}
                className="h-12 w-full font-bold text-foreground/30 hover:text-primary transition-colors"
              >
                Keep it Solo for now
              </Button>
            </div>
          </GlassCard>
        </DialogContent>
      </Dialog>

      {/* Revert Modal */}
      <Dialog open={isRevertModalOpen} onOpenChange={(open) => {
        setIsRevertModalOpen(open);
        if (!open) setScaleError(null);
      }}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold text-primary text-center">
                Revert Workspace?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {scaleError ? (
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-center space-y-4">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="text-sm font-bold text-red-600 leading-relaxed">
                    {scaleError}
                  </p>
                </div>
              ) : (
                <p className="text-center text-foreground/60 font-medium leading-relaxed">
                  Switching back to Solo Mode will hide workforce management tabs. Your team data will be preserved but inaccessible.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {!scaleError && (
                <Button
                  onClick={handleRevertToSolo}
                  className="h-16 w-full bg-primary text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20"
                >
                  Switch to Solo Mode
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsRevertModalOpen(false)}
                className="h-12 w-full font-bold text-foreground/30"
              >
                {scaleError ? "Understood" : "Cancel"}
              </Button>
            </div>
          </GlassCard>
        </DialogContent>
      </Dialog>

      {/* Add Service Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold text-primary">Add New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Service Name</FormLabel>
                <Input 
                  placeholder="e.g. Premium Laundry"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="h-12 rounded-xl bg-white/40 border-glass-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Price (₦)</FormLabel>
                  <Input 
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    className="h-12 rounded-xl bg-white/40 border-glass-border"
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Duration (Mins)</FormLabel>
                  <Input 
                    type="number"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({...newService, duration_minutes: parseInt(e.target.value)})}
                    className="h-12 rounded-xl bg-white/40 border-glass-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FormLabel>Description</FormLabel>
                <Textarea 
                  placeholder="Briefly describe what this service includes..."
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  className="rounded-xl bg-white/40 border-glass-border"
                />
              </div>
              <Button 
                onClick={handleAddService}
                disabled={isAdding}
                className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg mt-4"
              >
                {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Service"}
              </Button>
            </div>
          </GlassCard>
        </DialogContent>
      </Dialog>

      {/* Add Portfolio Modal */}
      <Dialog open={isPortfolioModalOpen} onOpenChange={setIsPortfolioModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <GlassCard className="border-white/40 shadow-2xl p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold text-primary">Add Portfolio Work</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div 
                className="relative h-48 w-full rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
                onClick={() => document.getElementById('portfolio-upload')?.click()}
              >
                {portfolioPreview ? (
                  <Image src={portfolioPreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <>
                    <Camera className="h-10 w-10 text-primary/30 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mt-2">Upload Work Image</p>
                  </>
                )}
                <input 
                  id="portfolio-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewPortfolio({...newPortfolio, image: file});
                      setPortfolioPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Work Title</FormLabel>
                <Input 
                  placeholder="e.g. Wedding Catering"
                  value={newPortfolio.title}
                  onChange={(e) => setNewPortfolio({...newPortfolio, title: e.target.value})}
                  className="h-12 rounded-xl bg-white/40 border-glass-border"
                />
              </div>
              <Button 
                onClick={handleAddPortfolio}
                disabled={isAdding}
                className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg mt-4"
              >
                {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish Work"}
              </Button>
            </div>
          </GlassCard>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Main Page ---

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const currentRole = user?.role || "customer";

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'verify') {
      setIsEditing(true);
      setTimeout(() => {
        document.getElementById('verification-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState<any>({
    name: "",
    username: "",
    email: "",
    phone: "",
    avatar: "",
    address: "",
    completion: 0,
    jobTitle: "",
    experience: "",
    bio: "",
    skills: [],
    acceptInstant: true,
    maestroAutoAssign: true,
    businessName: "",
    tagline: "",
    website: "",
    cacNumber: "",
    category: "",
    serviceTags: [],
    services: [],
    portfolio: [],
    bankName: "",
    accountNumber: "",
    accountName: "",
    banner: "https://images.unsplash.com/photo-1519415510236-85591bf59386?q=80&w=1200&auto=format&fit=crop", // Distinct banner
    logo: "",
    schedule: []
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        const role = data.role;
        const profile = data.profile || {};
        
        setProfileData({
          name: data.name || data.username || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: data.avatar || "",
          address: data.address || "",
          completion: data.completion || 0,
          // Staff fields
          jobTitle: profile.jobTitle || profile.job_title || "",
          experience: profile.experience || "",
          bio: profile.bio || "",
          skills: profile.skills || [],
          acceptInstant: profile.acceptInstant ?? true,
          maestroAutoAssign: profile.maestroAutoAssign ?? true,
          // Business fields
          businessName: profile.business?.name || profile.business_name || profile.businessName || "",
          tagline: profile.business?.description || profile.tagline || "",
          website: profile.website || "",
          cacNumber: profile.cac_number || profile.cacNumber || "",
          category: profile.business?.category || profile.category || "",
          serviceTags: profile.serviceTags || [],
          bankName: profile.bankName || "",
          accountNumber: profile.accountNumber || "",
          accountName: profile.accountName || "",
          banner: profile.business?.banner || profile.banner || "",
          logo: profile.business?.logo || profile.logo || data.avatar || "",
          services: profile.business?.services || profile.services || [],
          portfolio: profile.business?.portfolio || profile.portfolio || [],
          schedule: profile.business?.operating_hours || profile.schedule || [
            { day: 'Monday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Tuesday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Wednesday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Thursday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Friday', open: '09:00', close: '18:00', isClosed: false },
            { day: 'Saturday', open: '10:00', close: '16:00', isClosed: false },
            { day: 'Sunday', open: '12:00', close: '16:00', isClosed: true },
          ]
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    const toastId = toast.loading("Saving global settings...");
    setIsSaving(true);
    try {
      // Map to backend structure
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar,
        profile: {
          ...profileData,
          // Sync camelCase to Backend snake_case/expected keys
          businessName: profileData.businessName,
          cacNumber: profileData.cacNumber,
          bankName: profileData.bankName,
          accountNumber: profileData.accountNumber,
          accountName: profileData.accountName,
          schedule: profileData.schedule,
          jobTitle: profileData.jobTitle,
        }
      };
      
      await updateUser(updateData);
      setIsEditing(false);
      toast.success(currentRole === 'ceo' ? "Business operations updated successfully! ✅" : "Profile features updated! ✅", { id: toastId });
    } catch (err: any) {
        console.error("Failed to update profile:", err);
        toast.error(err?.message || "Error updating profile. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };


  if (!user || isInitialLoad) return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="pb-24">
      {/* Dynamic Floating Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase">Profile Control</h1>
              <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest mt-1">
                Role Context: {user.role === 'ceo' ? 'Business Operations' : user.role === 'staff' ? 'Professional Elite' : 'Personal Member'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          {isEditing ? (
            <div className="flex items-center gap-3 bg-white/40 p-1.5 rounded-2xl border border-glass-border backdrop-blur-md">
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="h-11 px-6 rounded-xl font-bold text-foreground/40 hover:text-red-500 hover:bg-red-500/5 transition-all"
              >
                <X className="h-4 w-4 mr-2" /> Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 px-8 rounded-xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-102 transition-transform"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Commit Updates
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="h-14 px-10 rounded-2xl bg-primary text-white font-extrabold text-lg shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1"
            >
              <Edit2 className="h-5 w-5 mr-3" /> Edit Global Settings
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentRole}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
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
              setIsEditing={setIsEditing}
              profileData={profileData}
              setProfileData={setProfileData}
            />
          )}
          {(currentRole === "ceo" || currentRole === "admin") && (
            <BusinessProfileView
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              profileData={profileData}
              setProfileData={setProfileData}
            />
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
