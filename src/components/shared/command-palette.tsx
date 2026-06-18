"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  Wallet,
  Heart,
  History,
  PlayCircle,
  MessageSquare,
  Star,
  ShoppingBag,
  UserCircle,
  LogOut,
  ShieldCheck,
  ScrollText,
  BarChart3,
  Building2,
  Plus,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Command = {
  id: string;
  label: string;
  hint?: string;
  group: "Recent" | "Navigate" | "Create" | "Account";
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
};

const RECENT_KEY = "guild-cmdk-recent";

export function CommandPalette() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* open/close wiring: ⌘K / Ctrl+K, custom event, and Esc */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecentIds(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {
      /* ignore */
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // reset transient UI state each time the palette opens
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const go = useCallback(
    (id: string, href: string) => {
      pushRecent(id);
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  /* role-aware command set */
  const commands = useMemo<Command[]>(() => {
    const role = user?.role;
    const nav: Array<[string, string, string, LucideIcon]> = [];
    if (role === "customer") {
      nav.push(
        ["nav-bookings", "My Bookings", "/customer", Calendar],
        ["nav-explore", "Explore Services", "/search", Search],
        ["nav-marketplace", "Marketplace", "/marketplace", ShoppingBag],
        ["nav-favorites", "Favorites", "/favorites", Heart],
        ["nav-activities", "Recent Activities", "/customer/activities", History],
      );
    } else if (role === "ceo") {
      nav.push(
        ["nav-overview", "Overview", "/home", LayoutDashboard],
        ["nav-bookings", "Bookings", "/bookings", Calendar],
        ["nav-staff", "Staff Management", "/staff", Users],
        ["nav-inventory", "Inventory", "/inventory", Package],
        ["nav-orders", "Orders", "/home/orders", ShoppingBag],
        ["nav-reviews", "Reviews", "/reviews", Star],
        ["nav-active", "Active Session", "/active-job", Clock],
      );
    } else if (role === "staff") {
      nav.push(
        ["nav-dash", "Dashboard", "/staff-portal", LayoutDashboard],
        ["nav-active", "Active Session", "/active-job", PlayCircle],
        ["nav-history", "Job History", "/job-history", History],
      );
    } else if (role === "admin") {
      nav.push(
        ["nav-dash", "Admin Dashboard", "/admin", LayoutDashboard],
        ["nav-verify", "Business Verification", "/admin/businesses", Building2],
        ["nav-reviews", "Reviews", "/admin/reviews", Star],
        ["nav-analytics", "Analytics", "/admin/analytics", BarChart3],
        ["nav-audit", "Audit Trail", "/admin/audit", ScrollText],
      );
    }
    nav.push(
      ["nav-wallet", "Wallet", "/wallet", Wallet],
      ["nav-inbox", "Inbox", "/inbox", MessageSquare],
    );

    const navCmds: Command[] = nav.map(([id, label, href, icon]) => ({
      id,
      label,
      hint: href,
      group: "Navigate",
      icon,
      keywords: label.toLowerCase(),
      run: () => go(id, href),
    }));

    const create: Command[] = [];
    if (role === "customer") create.push(mk("new-booking", "Book a service", "/search", Plus, () => go("new-booking", "/search")));
    if (role === "ceo")
      create.push(
        mk("add-product", "Add a product", "/inventory", Plus, () => go("add-product", "/inventory")),
        mk("invite-staff", "Invite a staff member", "/staff", Plus, () => go("invite-staff", "/staff")),
      );

    const account: Command[] = [
      mk("profile", "Profile & settings", "/profile", UserCircle, () => go("profile", "/profile"), "Account"),
      {
        id: "logout",
        label: "Log out",
        group: "Account",
        icon: LogOut,
        keywords: "sign out logout exit",
        run: () => {
          pushRecent("logout");
          setOpen(false);
          logout();
        },
      },
    ];

    return [...navCmds, ...create, ...account];
  }, [user?.role, go, logout]);

  /* filtering + grouping */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recents = recentIds
        .map((id) => commands.find((c) => c.id === id))
        .filter(Boolean)
        .slice(0, 4)
        .map((c) => ({ ...(c as Command), group: "Recent" as const }));
      return [...recents, ...commands];
    }
    const rank: Record<Command["group"], number> = { Recent: 0, Navigate: 1, Create: 2, Account: 3 };
    return commands
      .map((c) => ({ c, score: score(q, `${c.label} ${c.keywords ?? ""}`.toLowerCase()) }))
      .filter((x) => x.score > 0)
      // keep groups contiguous so the rendered order matches keyboard order
      .sort((a, b) => rank[a.c.group] - rank[b.c.group] || b.score - a.score)
      .map((x) => x.c);
  }, [query, commands, recentIds]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-950/40 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onListKey}
            className="w-full max-w-xl overflow-hidden rounded-panel border border-glass-border bg-card/95 shadow-e4 backdrop-blur-2xl"
          >
            {/* search */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search pages, actions, settings…"
                aria-label="Search commands"
                className="h-14 w-full bg-transparent text-body text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-caption font-bold text-muted-foreground sm:block">
                ESC
              </kbd>
            </div>

            {/* results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-body font-bold text-foreground">No results for “{query}”</p>
                  <p className="mt-1 text-small text-muted-foreground">Try a page name, or an action like “book”.</p>
                </div>
              ) : (
                filtered.map((c, idx) => {
                  const isActive = idx === active;
                  const showHeader = idx === 0 || filtered[idx - 1].group !== c.group;
                  return (
                    <div key={`${c.group}-${c.id}`}>
                      {showHeader && (
                        <p className="px-3 pb-1 pt-2 text-caption uppercase text-muted-foreground">{c.group}</p>
                      )}
                      <button
                        data-idx={idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={c.run}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          isActive ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                      >
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            isActive ? "bg-primary text-white" : "bg-muted text-foreground/60"
                          }`}
                        >
                          <c.icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 truncate text-small font-bold text-foreground">{c.label}</span>
                        {c.hint && <span className="hidden text-caption text-muted-foreground sm:block">{c.hint}</span>}
                        {isActive && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2.5 text-caption text-muted-foreground">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> navigate</span>
                <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> select</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> The Guild
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* helpers */
function mk(
  id: string,
  label: string,
  hint: string,
  icon: LucideIcon,
  run: () => void,
  group: Command["group"] = "Create",
): Command {
  return { id, label, hint, group, icon, keywords: label.toLowerCase(), run };
}

function pushRecent(id: string) {
  try {
    const cur: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const next = [id, ...cur.filter((x) => x !== id)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Lightweight subsequence-aware fuzzy score. */
function score(q: string, text: string): number {
  if (text.includes(q)) return 100 - text.indexOf(q);
  let qi = 0;
  for (let i = 0; i < text.length && qi < q.length; i++) {
    if (text[i] === q[qi]) qi++;
  }
  return qi === q.length ? 40 : 0;
}
