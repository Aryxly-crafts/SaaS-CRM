"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Users,
  FolderKanban,
  User,
  Receipt,
  Wallet,
  ArrowRight,
  Command,
  Loader2,
  X,
} from "lucide-react";
import { searchAllRecords, type SearchResultItem } from "@/app/(app)/search-actions";

export function CommandSearch({
  placeholder = "Search leads, projects, clients, expenses… (Press Ctrl+K)",
}: {
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Global keyboard shortcut listener: Ctrl+K / Cmd+K / Slash
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Live debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await searchAllRecords(query);
        setResults(res);
        setSelectedIndex(0);
      });
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      {/* TopBar Search Trigger Input */}
      <div
        onClick={() => setOpen(true)}
        className="border-line bg-surface-muted text-ink-subtle hover:border-line-strong hover:bg-surface relative flex max-w-md flex-1 cursor-pointer items-center gap-2 rounded-lg border py-2 pr-3 pl-9 text-body-md transition-colors"
      >
        <Search
          size={15}
          strokeWidth={1.75}
          className="text-ink-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <span className="truncate text-[13px]">{placeholder}</span>
        <div className="ml-auto hidden items-center gap-1 sm:flex">
          <kbd className="bg-surface border-line text-ink-muted rounded border px-1.5 py-0.5 text-[10px] font-semibold">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="border-line bg-surface flex w-full max-w-xl flex-col overflow-hidden rounded-[14px] border shadow-2xl"
            >
              {/* Search Bar Input */}
              <div className="border-line flex items-center gap-3 border-b px-4 py-3">
                <Search size={18} className="text-accent flex-shrink-0" strokeWidth={2} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type to search leads, projects, clients, expenses…"
                  className="text-ink placeholder:text-ink-subtle flex-1 bg-transparent text-[14px] outline-none"
                />
                {isSearching && <Loader2 size={16} className="animate-spin text-accent" />}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-ink-subtle hover:text-ink rounded p-1"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Search Results List */}
              <div className="scroll-hidden max-h-[380px] overflow-y-auto p-2">
                {query.trim() && !isSearching && results.length === 0 ? (
                  <div className="py-10 text-center text-body-md text-ink-subtle">
                    No results found for &ldquo;<span className="text-ink font-medium">{query}</span>&rdquo;
                  </div>
                ) : null}

                {!query.trim() ? (
                  <div className="flex flex-col gap-1 p-2 text-[12px] text-ink-muted">
                    <p className="font-semibold uppercase tracking-wider text-ink-subtle text-[10px] mb-1">
                      Quick Jump
                    </p>
                    <div
                      onClick={() => {
                        setOpen(false);
                        router.push("/leads");
                      }}
                      className="hover:bg-surface-muted flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors"
                    >
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <Users size={14} className="text-accent" /> Leads Pipeline
                      </span>
                      <ArrowRight size={13} className="text-ink-subtle" />
                    </div>
                    <div
                      onClick={() => {
                        setOpen(false);
                        router.push("/projects");
                      }}
                      className="hover:bg-surface-muted flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors"
                    >
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <FolderKanban size={14} className="text-accent" /> Projects &amp; Clients
                      </span>
                      <ArrowRight size={13} className="text-ink-subtle" />
                    </div>
                    <div
                      onClick={() => {
                        setOpen(false);
                        router.push("/expenses");
                      }}
                      className="hover:bg-surface-muted flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors"
                    >
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <Receipt size={14} className="text-accent" /> Expenses &amp; Payouts
                      </span>
                      <ArrowRight size={13} className="text-ink-subtle" />
                    </div>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-0.5">
                    {results.map((item, index) => {
                      const Icon =
                        item.type === "lead"
                          ? Users
                          : item.type === "project"
                          ? FolderKanban
                          : item.type === "client"
                          ? User
                          : item.type === "expense"
                          ? Receipt
                          : Wallet;

                      const selected = index === selectedIndex;

                      return (
                        <li
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                            selected ? "bg-surface-muted text-ink" : "text-ink hover:bg-surface-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${
                                selected ? "bg-accent text-white" : "bg-line text-ink-muted"
                              }`}
                            >
                              <Icon size={14} strokeWidth={2} />
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-[13px] truncate">{item.title}</p>
                              <p className="text-ink-muted text-[11.5px] truncate">{item.subtitle}</p>
                            </div>
                          </div>
                          {item.meta && (
                            <span className="bg-surface border border-line text-ink-muted ml-2 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
                              {item.meta}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer Keyboard Hints */}
              <div className="border-line bg-surface-muted flex items-center justify-between border-t px-4 py-2 text-[11px] text-ink-subtle">
                <span>Use ↑ ↓ to navigate, ↵ to select</span>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
