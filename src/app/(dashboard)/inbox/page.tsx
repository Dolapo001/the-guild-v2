"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { inboxService } from "@/services/inbox.service";
import { Conversation, Message } from "@/types/api";
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
  User as UserIcon,
  ShieldCheck,
  MessageSquare,
  Phone,
  Video,
  X,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'admin' | 'staff'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
      fetchSmartReplies(selectedChatId);
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await inboxService.getConversations();
      setConversations(data);
    } catch (err) {
      console.warn("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const data = await inboxService.getMessages(id);
      setMessages(data);
    } catch (err) {
      console.warn("Failed to fetch messages", err);
    }
  };

  const fetchSmartReplies = async (id: string) => {
    try {
      const data = await inboxService.getSmartReplies(id);
      setSmartReplies(data ?? []);
    } catch (err) {
      console.warn("Failed to fetch smart replies", err);
    }
  };

  if (!mounted) return null;

  const getOtherParticipant = (chat: Conversation) => {
    return chat.participants.find(p => p.uid !== user?.uid) || chat.participants[0];
  };

  const filteredConversations = conversations.filter(c => {
    const participant = getOtherParticipant(c);
    const participantName = participant?.username ?? "";
    const lastMsgText = c.last_message?.text ?? "";
    const matchesSearch = participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsgText.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filtering mapping
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'clients' && participant?.role === 'customer') ||
      (activeTab === 'admin' && participant?.role === 'admin') ||
      (activeTab === 'staff' && participant?.role === 'staff');
    
    return matchesSearch && matchesTab;
  });

  const selectedChat = conversations.find(c => c.uid === selectedChatId);
  const otherParticipant = selectedChat ? getOtherParticipant(selectedChat) : null;

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;
    try {
      const newMessage = await inboxService.sendMessage(selectedChatId, messageInput);
      setMessages(prev => [...prev, { ...newMessage, is_self: true }]);
      setMessageInput("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleSmartReply = (reply: string) => {
    setMessageInput(reply);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 overflow-hidden">
      {/* Left Column: Conversation List */}
      <div className={cn(
        "w-full md:w-[30%] flex flex-col gap-6 transition-all duration-300",
        showMobileChat ? "hidden md:flex" : "flex"
      )}>
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-foreground">Inbox</h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full bg-white/40 border border-glass-border rounded-2xl py-3 pl-11 pr-4 text-sm text-primary font-bold focus:ring-4 ring-primary/5 outline-none transition-all placeholder:text-primary/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex bg-white/40 p-1.5 rounded-2xl border border-glass-border shadow-inner">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black transition-all tracking-widest uppercase",
              activeTab === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-primary/40 hover:text-primary"
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black transition-all tracking-widest uppercase",
              activeTab === 'clients' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-primary/40 hover:text-primary"
            )}
          >
            Clients
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black transition-all tracking-widest uppercase",
              activeTab === 'staff' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-primary/40 hover:text-primary"
            )}
          >
            Staff
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black transition-all tracking-widest uppercase",
              activeTab === 'admin' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-primary/40 hover:text-primary"
            )}
          >
            Admin
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
          ) : (
            filteredConversations.map((chat) => {
              const participant = getOtherParticipant(chat);
              return (
                <button
                  key={chat.uid}
                  onClick={() => {
                    setSelectedChatId(chat.uid);
                    setShowMobileChat(true);
                  }}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all text-left flex gap-4 group relative overflow-hidden",
                    selectedChatId === chat.uid
                      ? "bg-white border-primary shadow-xl shadow-primary/5 scale-[1.02] z-10"
                      : "bg-white/40 border-glass-border hover:bg-white/60 hover:border-primary/20"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/10">
                      <img src={participant.avatar || `https://ui-avatars.com/api/?name=${participant.username}`} alt={participant.username} className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-primary truncate text-sm">{participant.username}</h4>
                      <span className="text-[10px] font-black text-primary/40">
                        {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs truncate text-primary/60 font-bold">
                      {chat.last_message?.text || "No messages yet"}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {chat.job_context && (
                        <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                          {chat.job_context.id.substring(0, 8)}
                        </span>
                      )}
                      <span className={cn(
                        "text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border",
                        participant.role === 'admin' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-gray-500 border-white/10"
                      )}>
                        {participant.role}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        !showMobileChat ? "hidden md:flex" : "flex"
      )}>
        <AnimatePresence mode="wait">
          {selectedChat && otherParticipant ? (
            <motion.div
              key={selectedChat.uid}
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
                        <img src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${otherParticipant.username}`} alt={otherParticipant.username} className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-black text-primary text-lg leading-tight">{otherParticipant.username}</h3>
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mt-0.5">
                        {otherParticipant.role}
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
                {selectedChat.job_context && (
                  <div className="px-6 py-3 bg-primary/5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Info className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Regarding Job #{selectedChat.job_context.id.substring(0,8)}</p>
                        <p className="text-xs font-black text-primary">{selectedChat.job_context.title} • {selectedChat.job_context.time}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg border-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-widest hover:bg-primary/10">
                      View Job Details
                    </Button>
                  </div>
                )}

                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <div
                      key={msg.uid}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        msg.sender === user?.uid || msg.is_self ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl text-sm font-medium shadow-lg",
                        msg.sender === user?.uid || msg.is_self
                          ? "bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-none"
                          : "bg-white/10 border border-white/10 text-white rounded-tl-none backdrop-blur-md"
                      )}>
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        <span className="text-[10px] font-bold text-gray-500">
                           {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {(msg.sender === user?.uid || msg.is_self) && (
                          msg.is_read ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Maestro Smart Suggestions */}
                {smartReplies.length > 0 && (
                  <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5">
                    <div className="shrink-0 flex items-center gap-2 mr-2">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest">Maestro:</span>
                    </div>
                    {smartReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleSmartReply(reply)}
                        className="shrink-0 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-300 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

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
                      aria-label="Send message"
                      className="h-12 w-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 shrink-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-24 w-24 bg-white/80 rounded-[2rem] flex items-center justify-center mx-auto border border-white shadow-2xl shadow-primary/10"
                >
                  <MessageSquare className="h-10 w-10 text-primary animate-pulse" />
                </motion.div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-primary">Select a conversation</h3>
                    <p className="text-sm font-bold text-primary/40 leading-relaxed">
                      Choose a conversation from the list to start messaging with your clients, staff, or admin.
                    </p>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
