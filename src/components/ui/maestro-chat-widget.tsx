"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, Scissors, Star } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "./button";
import Image from "next/image";

interface Message {
    id: string;
    text: string;
    sender: "bot" | "user";
    type?: "text" | "recommendation";
    data?: any;
}

export function MaestroChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage("Hello! I'm Maestro, your personal Guild assistant. How can I help you book today?");
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const addBotMessage = (text: string, type: "text" | "recommendation" = "text", data?: any) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text,
                sender: "bot",
                type,
                data
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text,
            sender: "user"
        }]);
        setInputValue("");

        if (text.toLowerCase().includes("barber") || text.toLowerCase().includes("haircut")) {
            addBotMessage("I found 3 top-rated barbers near you in Lekki Phase 1.", "recommendation", [
                { name: "Executive Cuts", rating: 4.9, price: "₦5,000", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=100&auto=format&fit=crop" },
                { name: "The Grooming Room", rating: 4.8, price: "₦7,500", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=100&auto=format&fit=crop" },
                { name: "Sharp Edge", rating: 4.7, price: "₦4,000", image: "https://images.unsplash.com/photo-1621605815841-aa897bd439b4?q=80&w=100&auto=format&fit=crop" },
            ]);
        } else {
            addBotMessage("I'm here to help! You can ask me to find services, check your bookings, or manage your wallet.");
        }
    };

    return (
        <div className="fixed bottom-6 right-24 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4"
                    >
                        <GlassCard className="w-[380px] h-[520px] flex flex-col overflow-hidden border-primary/20 shadow-2xl bg-card/95 backdrop-blur-2xl">
                            {/* Header */}
                            <div className="p-4 bg-primary text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                        <Sparkles className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm"><span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maestro</span> Assistant</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Maestro Intelligence</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-xl">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[85%] flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${msg.sender === "bot" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                                                {msg.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                            </div>
                                            <div className="space-y-2">
                                                <div className={`p-3 rounded-2xl text-sm font-medium ${msg.sender === "user"
                                                    ? "bg-primary text-white rounded-tr-none"
                                                    : "bg-card border border-glass-border text-foreground rounded-tl-none shadow-sm"
                                                    }`}>
                                                    {msg.text}
                                                </div>

                                                {msg.type === "recommendation" && (
                                                    <div className="grid gap-2 mt-2">
                                                        {msg.data.map((item: any, i: number) => (
                                                            <div key={i} className="bg-card border border-glass-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors cursor-pointer group shadow-sm">
                                                                <div className="h-12 w-12 rounded-lg overflow-hidden relative shrink-0">
                                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex items-center gap-0.5 text-accent">
                                                                            <Star className="h-2.5 w-2.5 fill-accent" />
                                                                            <span className="text-[10px] font-bold">{item.rating}</span>
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-foreground/60">{item.price}</span>
                                                                    </div>
                                                                </div>
                                                                <ArrowRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] flex gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                            <div className="bg-card border border-glass-border text-foreground p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-bounce" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-bounce [animation-delay:0.2s]" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-glass-border bg-glass-surface/20">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend(inputValue);
                                    }}
                                    className="relative"
                                >
                                    <input
                                        placeholder="Ask Maestro for what you need..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="w-full h-12 pl-4 pr-12 bg-card border border-glass-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                                        disabled={!inputValue.trim() || isTyping}
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                                <div className="flex gap-2 mt-3">
                                    {["Find a Barber", "Book Spa", "Check Wallet"].map((chip) => (
                                        <button
                                            key={chip}
                                            onClick={() => handleSend(chip)}
                                            className="text-[10px] font-bold text-foreground/60 bg-primary/5 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-white text-primary' : 'bg-primary text-white hover:scale-110'}`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
            </Button>
        </div>
    );
}
