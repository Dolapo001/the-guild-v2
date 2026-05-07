"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { maestroService } from "@/services/maestro.service";
import { Service as ApiService, Product as ApiProduct } from "@/types/api";
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  ChevronLeft,
  Share2,
  Heart,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
  Users,
  Briefcase,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { BookingModal } from "@/components/shared/booking-modal";
import { StaffProfileModal, StaffMember } from "@/components/shared/staff-profile-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ServiceDetailPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [preSelectedStaffId, setPreSelectedStaffId] = useState<string | null>(null);

  // Staff Modal State
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const data = await maestroService.getBusiness(businessId);
        setBusiness(data);
      } catch (err) {
        console.error("Failed to fetch business", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [businessId]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );
  if (!business) return null;

  const handleViewStaff = (staff: any) => {
    setSelectedStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleBookStaff = (staffId: string) => {
    setIsStaffModalOpen(false);
    setPreSelectedStaffId(staffId);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setTimeout(() => setPreSelectedStaffId(null), 300);
  };

  const businessImage = business.image_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-background bg-mesh-gradient pb-24">
      {/* Top Nav */}
      <div className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-glass-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="font-bold text-primary ">
            <Link href="/search">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Search
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/20 ">
              <Share2 className="h-5 w-5 text-foreground/60" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/20 ">
              <Heart className="h-5 w-5 text-foreground/60" />
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 pt-24">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Content */}
          <div className="flex-1 space-y-10">
            {/* Hero Image */}
            <div className="relative h-[400px] md:h-[500px] w-full rounded-[32px] overflow-hidden shadow-2xl">
              <Image
                src={businessImage}
                alt={business.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex flex-wrap gap-3 mb-4">
                  {business.is_verified && (
                    <Badge className="bg-accent text-white border-0 px-3 py-1 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> CAC VERIFIED
                    </Badge>
                  )}
                  <Badge className="bg-secondary text-primary border-0 px-3 py-1 font-bold flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-primary" /> {business.rating} (Verified Business)
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{business.name}</h1>
                <p className="text-white/80 font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {business.location_name}
                </p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-8 border-b border-glass-border overflow-x-auto no-scrollbar">
              {[
                { id: "services", name: "Services", icon: Briefcase },
                { id: "reviews", name: "Reviews", icon: MessageSquare },
                { id: "staff", name: "Staff", icon: Users },
                { id: "portfolio", name: "Portfolio", icon: ImageIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-primary ' : 'text-foreground/40 hover:text-primary/60 '
                    }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === "services" && (
                <div className="space-y-6">
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-xl font-bold text-primary mb-4">About this business</h3>
                    <p className="text-foreground/60 leading-relaxed font-medium">{business.description}</p>
                  </div>
                  <div className="grid gap-4">
                    {business.services?.map((s: any, i: number) => (
                      <GlassCard
                        key={i}
                        className={`p-6 cursor-pointer transition-all border-white/40 hover:bg-white/80 ${selectedService?.name === s.name ? 'ring-2 ring-primary bg-white/90 ' : ''
                          }`}
                        onClick={() => setSelectedService(s)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-primary mb-1">{s.name}</h4>
                            <p className="text-xs text-foreground/40 font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {s.duration_minutes || 60} mins
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-extrabold text-primary ">₦{Number(s.price).toLocaleString()}</p>
                            {selectedService?.name === s.name && (
                              <div className="text-accent flex items-center gap-1 text-[10px] font-bold uppercase mt-1">
                                <CheckCircle2 className="h-3 w-3" /> Selected
                              </div>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                   <div className="flex flex-col items-center justify-center py-20 text-center">
                      <MessageSquare className="h-12 w-12 text-foreground/20 mb-4" />
                      <p className="text-foreground/40 font-medium">No reviews yet for this business.</p>
                   </div>
                </div>
              )}

              {activeTab === "staff" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {business.staff?.map((staff: any) => (
                    <GlassCard key={staff.uid} className="p-6 flex items-center gap-6 border-white/40 hover:border-primary/30 transition-all group">
                      <div className="relative">
                        <Avatar className="h-20 w-20 border-2 border-white shadow-lg">
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback>{staff.username[0]}</AvatarFallback>
                        </Avatar>
                        {staff.verification_status === 'VERIFIED' && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-extrabold text-primary truncate">{staff.username}</h4>
                        <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-2">{staff.role}</p>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-500" /> 5.0
                          </div>
                          <div className="h-3 w-px bg-glass-border" />
                          <div className="text-xs font-bold text-foreground/40">
                            Verified Staff
                          </div>
                        </div>

                        <Button
                          onClick={() => handleViewStaff(staff)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-glass-border font-bold text-xs h-8 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                        >
                          View Profile
                        </Button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {activeTab === "portfolio" && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   <div className="col-span-full py-20 text-center">
                      <ImageIcon className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                      <p className="text-foreground/40 font-medium">No portfolio images uploaded.</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Booking Widget */}
          <aside className="lg:w-[400px]">
            <div className="sticky top-28">
              <GlassCard className="p-8 border-white/60 shadow-2xl bg-white/80 backdrop-blur-xl">
                <h3 className="text-xl font-extrabold text-primary mb-8">Book an Appointment</h3>

                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-4">Selected Service</p>
                    {selectedService ? (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                        <span className="font-bold text-primary ">{selectedService.name}</span>
                        <span className="font-extrabold text-primary ">₦{Number(selectedService.price).toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border-2 border-dashed border-glass-border text-center">
                        <p className="text-sm font-bold text-foreground/30 italic">Please select a service from the list</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-4">Date</p>
                      <Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary justify-start hover:bg-primary/5 ">
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-40" /> Select Date
                      </Button>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-4">Time</p>
                      <Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary justify-start hover:bg-primary/5 ">
                        <Clock className="mr-2 h-4 w-4 opacity-40" /> Select Time
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-glass-border">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-foreground/60">Total Amount</span>
                      <span className="text-2xl font-extrabold text-primary ">
                        ₦{selectedService ? Number(selectedService.price).toLocaleString() : '0'}
                      </span>
                    </div>

                    {!business.is_verified && (
                      <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold leading-relaxed flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          Booking Disabled: This vendor is currently unverified. Verification is required before they can accept bookings.
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setIsBookingModalOpen(true)}
                      disabled={!business.is_verified}
                      className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-lg shadow-xl shadow-primary/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:border-gray-200"
                    >
                      {business.is_verified ? (
                        <>Proceed to Book <ArrowRight className="ml-2 h-5 w-5" /></>
                      ) : (
                        "Booking Disabled"
                      )}
                    </Button>
                    <p className="text-center text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                      Secure Escrow Payment
                    </p>
                  </div>
                </div>
              </GlassCard>

              <div className="mt-6 p-6 rounded-2xl bg-accent/5 border border-accent/10">
                <h4 className="font-bold text-accent text-sm mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Why book on The Guild?
                </h4>
                <ul className="space-y-2">
                  {["Verified CAC Registration", "Escrow Payment Protection", "Verified Customer Reviews"].map((item, i) => (
                    <li key={i} className="text-xs font-bold text-foreground/50 flex items-center gap-2">
                      <div className="h-1 w-1 bg-accent rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Bottom Sheet (Simplified) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-glass-border z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Total</p>
            <p className="text-xl font-extrabold text-primary ">
              ₦{selectedService ? Number(selectedService.price).toLocaleString() : '0'}
            </p>
          </div>
          <Button
            onClick={() => setIsBookingModalOpen(true)}
            disabled={!business.is_verified}
            className="flex-1 h-12 rounded-xl bg-primary text-white font-bold disabled:bg-gray-100 disabled:text-gray-400"
          >
            {business.is_verified ? "Book Now" : "Booking Disabled"}
          </Button>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        service={business}
        initialStaffId={preSelectedStaffId}
      />

      <StaffProfileModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staff={selectedStaff}
        onBookNow={handleBookStaff}
      />
    </div>
  );
}
