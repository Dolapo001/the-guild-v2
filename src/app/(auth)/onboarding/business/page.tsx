"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { maestroService } from "@/services/maestro.service";
import { trustService } from "@/services/trust.service";
import { LocationPicker, LocationData } from "@/components/shared/location-picker";
import { MapModal } from "@/components/shared/map-modal";
import {
  User,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  MapPin,
  ShieldCheck,
  Upload,
  Sparkles,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const STEPS = [
  { id: 1, title: "Identity", icon: Building2 },
  { id: 2, title: "Operation", icon: Users },
  { id: 3, title: "Logistics", icon: MapPin },
  { id: 4, title: "Verification", icon: ShieldCheck },
];

export default function BusinessOnboarding() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [cities, setCities] = useState<{id: string, name: string, latitude: number, longitude: number}[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    categories: [] as string[],
    description: "",
    isSolo: true,
    address: "",
    city: "Lagos",
    isMobile: false,
    latitude: 6.5244,
    longitude: 3.3792,
    cacDocument: null as File | null,
    cacNumber: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  
  useEffect(() => {
    maestroService.getCategories().then((data: any) => {
      setCategories(data);
      if (data.length > 0 && formData.categories.length === 0) {
        setFormData(prev => ({ ...prev, categories: [data[0].name] }));
      }
    }).catch((err: any) => console.error("Failed to load categories:", err));

    maestroService.getCities().then((data: any) => {
      setCities(data);
      if (data.length > 0 && !formData.city) {
        setFormData(prev => ({ ...prev, city: data[0].name }));
      }
    }).catch((err: any) => console.error("Failed to load cities:", err));
  }, []);

  const toggleCategory = (catName: string) => {
    setFormData(prev => {
      if (prev.categories.includes(catName)) {
        if (prev.categories.length === 1) return prev; // Keep at least one
        return { ...prev, categories: prev.categories.filter(c => c !== catName) };
      }
      if (prev.categories.length >= 2) {
        // Option: Replace the last one or just ignore. Let's replace the second one or show limit.
        // User said "one or two", so let's limit to 2.
        return { ...prev, categories: [prev.categories[0], catName] };
      }
      return { ...prev, categories: [...prev.categories, catName] };
    });
  };

  const handleLocationSelect = (loc: LocationData) => {
    setSelectedLocation(loc);
    setFormData(prev => ({
      ...prev,
      address: loc.address,
      latitude: loc.lat,
      longitude: loc.lng,
    }));
  };

  const handleFinish = async (isSkip: boolean = false) => {
    try {
      setIsUploading(true);
      
      // 1. Upload Document if present
      if (formData.cacDocument && !isSkip) {
        try {
          await trustService.uploadDocument('cac', formData.cacDocument);
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      // 2. Update Profile
      const payload: any = {
        isSoloOperator: formData.isSolo,
        profile: {
          businessName: formData.businessName || "My Business",
          categories: formData.categories.length > 0 ? formData.categories : ["Uncategorized"],
          tagline: formData.description || "A new business on The Guild",
          address: formData.address || "Lagos, Nigeria",
          latitude: formData.latitude || 6.5244,
          longitude: formData.longitude || 3.3792,
          city: formData.city || "Lagos",
          isMobile: formData.isMobile,
          cacNumber: formData.cacNumber || "PENDING"
        }
      };
      
      // Only set to pending if they actually completed it, otherwise stay unverified
      if (!isSkip) {
        payload.verificationStatus = "pending";
      }

      await updateUser(payload);
      
      router.push("/home");
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2",
                step >= s.id
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-card border-slate-200 text-slate-400"
              )}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                step >= s.id ? "text-primary" : "text-slate-400"
              )}>{s.title}</span>
            </div>
          ))}
          {/* Connecting Lines */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-200 -z-10 px-12">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <GlassCard className="p-8 md:p-12 border-slate-200/50 shadow-2xl bg-white/95">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Tell us about your craft.</h2>
                  <p className="text-muted-foreground text-lg font-medium">Let's start with the basics of your business.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Business Name</label>
                    <Input
                      placeholder="e.g. Glow Spa"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-lg font-bold focus:ring-primary/20 text-slate-900 placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Categories (Select up to 2)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.name)}
                          className={cn(
                            "px-4 py-4 rounded-2xl border-2 font-bold text-sm transition-all text-left flex items-center justify-between group",
                            formData.categories.includes(cat.name)
                              ? "bg-primary/5 border-primary text-primary shadow-sm"
                              : "bg-slate-50 border-slate-200 text-muted-foreground hover:border-slate-300"
                          )}
                        >
                          {cat.name}
                          {formData.categories.includes(cat.name) && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                      {categories.length === 0 && (
                        <div className="col-span-2 py-8 text-center text-slate-400 italic font-medium">
                          Loading categories...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Description</label>
                    <textarea
                      placeholder="Tell us what makes your service special..."
                      className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-slate-300"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">How do you operate?</h2>
                  <p className="text-muted-foreground text-lg font-medium">This helps us customize your dashboard experience.</p>
                </div>

                <div className="flex flex-col gap-6">
                  <div
                    onClick={() => setFormData({ ...formData, isSolo: true })}
                    className={cn(
                      "relative p-6 rounded-3xl border-2 transition-all cursor-pointer group flex items-start gap-6",
                      formData.isSolo
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      formData.isSolo ? "bg-primary text-white" : "bg-slate-200 text-muted-foreground"
                    )}>
                      <User className="h-7 w-7" />
                    </div>
                    <div className="flex-1 pr-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">Solo Professional</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        I work alone. I manage my own bookings and perform the services myself.
                      </p>
                    </div>
                    {formData.isSolo && (
                      <div className="absolute top-6 right-6 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, isSolo: false })}
                    className={cn(
                      "relative p-6 rounded-3xl border-2 transition-all cursor-pointer group flex items-start gap-6",
                      !formData.isSolo
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      !formData.isSolo ? "bg-primary text-white" : "bg-slate-200 text-muted-foreground"
                    )}>
                      <Users className="h-7 w-7" />
                    </div>
                    <div className="flex-1 pr-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">Team / Agency</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        I manage a team. I have staff members or riders who fulfill orders.
                      </p>
                    </div>
                    {!formData.isSolo && (
                      <div className="absolute top-6 right-6 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Location & Logistics</h2>
                  <p className="text-muted-foreground text-lg font-medium">Where can customers find you?</p>
                </div>

                <div className="space-y-5">
                  {/* Map Location Picker */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Business Location</label>
                    
                    {/* Selected location preview */}
                    {selectedLocation ? (
                      <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 leading-snug break-words">{selectedLocation.address}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                          </p>
                        </div>
                        <button
                          onClick={() => setMapOpen(true)}
                          className="text-[10px] font-extrabold text-primary uppercase tracking-widest shrink-0 hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMapOpen(true)}
                        className="w-full h-14 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center gap-3 px-4 text-muted-foreground font-bold hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group"
                      >
                        <MapPin className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm">Pick location on map</span>
                      </button>
                    )}
                  </div>

                  {/* City Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">City</label>
                    <div className="relative">
                      <select
                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                        value={formData.city}
                        onChange={(e) => {
                          const newCityName = e.target.value;
                          const cityData = cities.find(c => c.name === newCityName);
                          setFormData(prev => ({ 
                            ...prev, 
                            city: newCityName,
                            // Update default coords if no location selected yet
                            ...( !selectedLocation ? {
                              latitude: cityData?.latitude || prev.latitude,
                              longitude: cityData?.longitude || prev.longitude
                            } : {})
                          }));
                        }}
                      >
                        {cities.map((city) => (
                          <option key={city.id} value={city.name}>{city.name}</option>
                        ))}
                        {cities.length === 0 && <option value="">Loading cities...</option>}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Mobile Services Toggle */}
                  <div
                    onClick={() => setFormData({ ...formData, isMobile: !formData.isMobile })}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                      formData.isMobile ? "bg-secondary/10 border-secondary" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        formData.isMobile ? "bg-secondary text-white" : "bg-slate-200 text-muted-foreground"
                      )}>
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">I offer mobile services</h4>
                        <p className="text-sm text-muted-foreground font-medium">I can travel to the customer's location.</p>
                      </div>
                    </div>
                    <div className={cn(
                      "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      formData.isMobile ? "bg-secondary border-secondary" : "border-slate-300"
                    )}>
                      {formData.isMobile && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Let's get you verified.</h2>
                  <p className="text-muted-foreground text-lg font-medium">Verified businesses earn 3x more and build trust faster.</p>
                </div>

                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-8 border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center gap-4 transition-all hover:border-primary/50 hover:bg-primary/5 cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormData({ ...formData, cacDocument: file });
                      }}
                    />
                    <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      {formData.cacDocument ? (
                        <FileText className="h-10 w-10 text-primary" />
                      ) : (
                        <Upload className="h-10 w-10 text-slate-400 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {formData.cacDocument ? formData.cacDocument.name : "Upload CAC Document"}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">PDF, JPG or PNG (Max 5MB)</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-2 h-11 px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-card"
                    >
                      {formData.cacDocument ? "Change File" : "Select File"}
                    </Button>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                    <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Your data is encrypted and used only for verification purposes. Verification usually takes 24-48 hours.
                    </p>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => handleFinish(true)}
                      className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-4"
                    >
                      Skip for now, I'll do it later
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 pt-8 border-t border-border">
            {step > 1 && (
              <Button
                onClick={prevStep}
                variant="ghost"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl font-bold text-slate-400 hover:text-slate-700 hover:bg-muted order-2 sm:order-1"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
            )}
            <Button
              onClick={() => step === 4 ? handleFinish(false) : nextStep()}
              disabled={isUploading || (step === 3 && !selectedLocation)}
              className={cn(
                "w-full sm:flex-1 h-14 rounded-2xl bg-primary text-white font-extrabold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all order-1 sm:order-2",
                (isUploading || (step === 3 && !selectedLocation)) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? "Processing..." : (step === 4 ? "Complete Setup" : "Continue")} 
              {!isUploading && <ChevronRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Map Modal */}
        <MapModal 
          isOpen={mapOpen}
          onClose={() => setMapOpen(false)}
          title="Pin Your Business Location"
        >
          <LocationPicker
            onSelect={handleLocationSelect}
            onClose={() => setMapOpen(false)}
            initialLocation={selectedLocation || { 
              lat: formData.latitude, 
              lng: formData.longitude, 
              address: `Centering on ${formData.city}...` 
            }}
          />
        </MapModal>
    </div>
  );
}
