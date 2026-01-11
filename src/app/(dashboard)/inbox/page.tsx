"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
    Search,
    MoreVertical,
    Paperclip,
    Send,
    ChevronLeft,
    Clock,
    Info,
    CheckCheck,
    Check,
    Sparkles,
    User,
    ShieldCheck,
    MessageSquare,
    Phone,
    Video,
    X,
    Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Mock Data Structure
const MOCK_CONVERSATIONS = {
    staff: [
        {
            id: 1,
            name: "Alice Johnson",
            role: "client",
            jobId: "JOB-102",
            jobTitle: "Deep Tissue Massage",
            jobTime: "Today, 2:00 PM",
            lastMessage: "I'm at the gate.",
            timestamp: "10:42 AM",
            unread: 2,
            online: true,
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
            history: [
                { id: 1, sender: 'me', text: "Hi Alice, confirming our 2 PM?", time: "09:15 AM", status: 'read' },
                { id: 2, sender: 'them', text: "Yes! See you soon.", time: "09:20 AM" },
                { id: 3, sender: 'them', text: "I'm at the gate.", time: "10:42 AM" }
            ]
        },
        {
            id: 2,
            name: "Glow Spa Admin",
            role: "admin",
            lastMessage: "Please submit your weekly report.",
            timestamp: "Yesterday",
            unread: 0,
            online: false,
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop",
            history: [
                { id: 1, sender: 'them', text: "Please submit your weekly report.", time: "Yesterday" }
            ]
        }
    ],
    customer: [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "staff",
            jobId: "JOB-102",
            jobTitle: "Deep Tissue Massage",
            jobTime: "Today, 2:00 PM",
            lastMessage: "I'm on my way! 🚗",
            timestamp: "1:15 PM",
            unread: 1,
            online: true,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
            history: [
                { id: 1, sender: 'them', text: "Hi! I'm Sarah, your therapist for today.", time: "12:30 PM", status: 'read' },
                { id: 2, sender: 'me', text: "Great, see you soon!", time: "12:45 PM", status: 'read' },
                { id: 3, sender: 'them', text: "I'm on my way! 🚗", time: "1:15 PM" }
            ]
        },
        {
            id: 3,
            name: "Maestro Support",
            role: "admin",
            lastMessage: "Your refund has been processed.",
            timestamp: "2 days ago",
            unread: 0,
            online: true,
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
            history: [
                { id: 1, sender: 'them', text: "Your refund has been processed.", time: "2 days ago" }
            ]
        }
    ],
    ceo: [
        {
            id: 4,
            name: "Operations Team",
            role: "admin",
            lastMessage: "Monthly revenue report is ready.",
            timestamp: "9:00 AM",
            unread: 5,
            online: true,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
            history: [
                { id: 1, sender: 'them', text: "Monthly revenue report is ready.", time: "9:00 AM" }
            ]
        },
        {
            id: 5,
            name: "Sarah Johnson (Staff)",
            role: "staff",
            lastMessage: "Requesting leave for next Friday.",
            timestamp: "Yesterday",
            unread: 0,
            online: false,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
            history: [
                { id: 1, sender: 'them', text: "Requesting leave for next Friday.", time: "Yesterday" }
            ]
        }
    ]
};

const SMART_REPLIES = [
    "I'm on my way 🚗",
    "Running 5 mins late ⏱️",
    "Here!",
    "Confirming now ✅",
    "Thank you!"
];

export default function InboxPage() {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'admin' | 'staff'>('all');
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [showMobileChat, setShowMobileChat] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatId, MOCK_CONVERSATIONS]);

    if (!mounted) return null;

    const role = user?.role === 'ceo' ? 'ceo' : user?.role === 'customer' ? 'customer' : 'staff';
    const conversations = MOCK_CONVERSATIONS[role as keyof typeof MOCK_CONVERSATIONS] || [];

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'clients' && c.role === 'client') ||
            (activeTab === 'admin' && c.role === 'admin') ||
            (activeTab === 'staff' && c.role === 'staff');
        return matchesSearch && matchesTab;
    });

    const selectedChat = conversations.find(c => c.id === selectedChatId);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        // In a real app, logic to send message
        setMessageInput("");
    };

    const handleSmartReply = (reply: string) => {
        setMessageInput(reply);
        // Optionally send immediately
    };

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6 overflow-hidden">
            {/* Left Column: Conversation List */}
            <div className={cn(
                "w-full md:w-[30%] flex flex-col gap-6 transition-all duration-300",
                showMobileChat ? "hidden md:flex" : "flex"
            )}>
                <div className="space-y-4">
                    <h1 className="text-3xl font-extrabold text-white">Inbox</h1>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 ring-primary/20 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                            activeTab === 'all' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        All
                    </button>
                    {role === 'staff' && (
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                                activeTab === 'clients' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Clients
                        </button>
                    )}
                    {role === 'customer' && (
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                                activeTab === 'staff' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Staff
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={cn(
                            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                            activeTab === 'admin' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Admin
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {filteredConversations.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => {
                                setSelectedChatId(chat.id);
                                setShowMobileChat(true);
                            }}
                            className={cn(
                                "w-full p-4 rounded-2xl border transition-all text-left flex gap-4 group",
                                selectedChatId === chat.id
                                    ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                            )}
                        >
                            <div className="relative shrink-0">
                                <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/10">
                                    <img src={chat.avatar} alt={chat.name} className="h-full w-full object-cover" />
                                </div>
                                {chat.online && (
                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-[#0f111a] rounded-full" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-white truncate">{chat.name}</h4>
                                    <span className="text-[10px] font-bold text-gray-500">{chat.timestamp}</span>
                                </div>
                                <p className={cn(
                                    "text-xs truncate",
                                    chat.unread > 0 ? "text-white font-bold" : "text-gray-400 font-medium"
                                )}>
                                    {chat.lastMessage}
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                    {chat.jobId && (
                                        <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                            {chat.jobId}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                        chat.role === 'admin' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-gray-500 border-white/10"
                                    )}>
                                        {chat.role}
                                    </span>
                                </div>
                            </div>
                            {chat.unread > 0 && (
                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-primary/20">
                                    {chat.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Column: Chat Window */}
            <div className={cn(
                "flex-1 flex flex-col transition-all duration-300",
                !showMobileChat ? "hidden md:flex" : "flex"
            )}>
                <AnimatePresence mode="wait">
                    {selectedChat ? (
                        <motion.div
                            key={selectedChat.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <GlassCard className="flex-1 border-white/10 bg-white/5 flex flex-col overflow-hidden p-0 rounded-3xl">
                                {/* Chat Header */}
                                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="md:hidden h-10 w-10 rounded-xl"
                                            onClick={() => setShowMobileChat(false)}
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </Button>
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/10">
                                                <img src={selectedChat.avatar} alt={selectedChat.name} className="h-full w-full object-cover" />
                                            </div>
                                            {selectedChat.online && (
                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-[#1a1c26] rounded-full" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-white text-lg">{selectedChat.name}</h3>
                                            <p className="text-xs font-bold text-green-500 flex items-center gap-1.5">
                                                {selectedChat.online ? "Online" : "Offline"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5">
                                            <Video className="h-4 w-4 text-gray-400" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5">
                                            <MoreVertical className="h-4 w-4 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Job Context Strip */}
                                {selectedChat.jobId && (
                                    <div className="px-6 py-3 bg-primary/5 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                <Info className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest">Regarding Job #{selectedChat.jobId}</p>
                                                <p className="text-xs font-bold text-white">{selectedChat.jobTitle} • {selectedChat.jobTime}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-8 rounded-lg border-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-widest hover:bg-primary/10">
                                            View Job Details
                                        </Button>
                                    </div>
                                )}

                                {/* Message Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                    {selectedChat.history?.map((msg, i) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col max-w-[80%]",
                                                msg.sender === 'me' ? "ml-auto items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-4 rounded-2xl text-sm font-medium shadow-lg",
                                                msg.sender === 'me'
                                                    ? "bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-none"
                                                    : "bg-white/10 border border-white/10 text-white rounded-tl-none backdrop-blur-md"
                                            )}>
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 px-1">
                                                <span className="text-[10px] font-bold text-gray-500">{msg.time}</span>
                                                {msg.sender === 'me' && (
                                                    msg.status === 'read' ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3 text-gray-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Maestro Smart Suggestions */}
                                <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5">
                                    <div className="shrink-0 flex items-center gap-2 mr-2">
                                        <Sparkles className="h-4 w-4 text-secondary" />
                                        <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest">Maestro:</span>
                                    </div>
                                    {SMART_REPLIES.map((reply) => (
                                        <button
                                            key={reply}
                                            onClick={() => handleSmartReply(reply)}
                                            className="shrink-0 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-300 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <div className="p-6 bg-white/5 backdrop-blur-2xl border-t border-white/10">
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 shrink-0">
                                            <Paperclip className="h-5 w-5 text-gray-400" />
                                        </Button>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-sm text-white focus:ring-2 ring-primary/20 outline-none transition-all"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim()}
                                            className="h-12 w-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 shrink-0"
                                        >
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                                    <MessageSquare className="h-10 w-10 text-white/10" />
                                </div>
                                <h3 className="text-xl font-extrabold text-white">Select a conversation</h3>
                                <p className="text-sm font-bold text-gray-500 max-w-xs mx-auto">
                                    Choose a conversation from the list to start messaging with your clients, staff, or admin.
                                </p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
