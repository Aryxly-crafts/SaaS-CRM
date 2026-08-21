"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  PhoneCall,
  MoreHorizontal,
  Wallet,
  Receipt,
  FileText,
  Settings,
  LogOut,
  X,
  Plus,
} from "lucide-react";
import { signOut } from "@/app/(app)/actions";
import { WorkspaceSwitcher } from "./workspace-switcher";
import type { WorkspaceType } from "@/lib/leads";

interface MobileNavProps {
  userEmail: string;
  currentMode: WorkspaceType;
}

const PRIMARY_TABS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: PhoneCall },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

const MORE_LINKS = [
  { href: "/payments", label: "Payments", icon: Wallet, desc: "Invoices, milestones & dues" },
  { href: "/expenses", label: "Expenses", icon: Receipt, desc: "Founder payouts & spending" },
  { href: "/documents", label: "Documents", icon: FileText, desc: "Agreements, SOWs & files" },
  { href: "/settings", label: "Settings", icon: Settings, desc: "Preferences & PWA setup" },
];

function isTabActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function MobileNav({ userEmail, currentMode }: MobileNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const initial = userEmail.charAt(0).toUpperCase() || "A";

  const isMoreActive = MORE_LINKS.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="bg-surface/95 border-line fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t px-2 py-1.5 backdrop-blur-lg md:hidden"
        style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
      >
        {PRIMARY_TABS.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors ${
                active ? "text-accent font-semibold" : "text-ink-subtle hover:text-ink font-normal"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="bg-accent absolute -top-1.5 h-0.5 w-6 rounded-full"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Icon size={19} strokeWidth={active ? 2.25 : 1.75} />
              <span className="mt-1 text-[10.5px] leading-none tracking-tight">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`relative flex flex-1 cursor-pointer flex-col items-center justify-center py-1 text-center transition-colors ${
            moreOpen || isMoreActive
              ? "text-accent font-semibold"
              : "text-ink-subtle hover:text-ink font-normal"
          }`}
        >
          {(moreOpen || isMoreActive) && (
            <motion.div
              layoutId="mobileNavIndicator"
              className="bg-accent absolute -top-1.5 h-0.5 w-6 rounded-full"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <MoreHorizontal size={19} strokeWidth={isMoreActive || moreOpen ? 2.25 : 1.75} />
          <span className="mt-1 text-[10.5px] leading-none tracking-tight">More</span>
        </button>
      </nav>

      {/* More Slide-Up Bottom Sheet Drawer */}
      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-[2px]"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="bg-surface border-line relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-[22px] border-t p-5 shadow-2xl"
              style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
            >
              {/* Drawer Drag Pill Handle */}
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-ink text-[16px] font-semibold">Workspace Menu</h3>
                  <p className="text-ink-muted text-[12px]">Financials, documents & settings</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="text-ink-subtle hover:text-ink hover:bg-surface-muted flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Workspace Switcher in Drawer */}
              <div className="mb-4">
                <WorkspaceSwitcher currentMode={currentMode} variant="sidebar" />
              </div>

              {/* Quick Add Button */}
              <Link
                href="/leads"
                onClick={() => setMoreOpen(false)}
                className="bg-accent hover:bg-accent-hover mb-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium text-white shadow-sm transition-colors"
              >
                <Plus size={16} strokeWidth={2.2} />
                New Lead or Entry
              </Link>

              {/* Menu Links */}
              <div className="flex flex-col gap-1">
                {MORE_LINKS.map((link) => {
                  const active = pathname.startsWith(link.href);
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                        active ? "bg-surface-muted text-ink font-medium" : "text-ink hover:bg-surface-muted"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                          active ? "bg-accent text-white" : "bg-line/70 text-ink-muted"
                        }`}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium leading-snug">{link.label}</p>
                        <p className="text-ink-subtle truncate text-[11.5px]">{link.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Founder Account & Sign Out */}
              <div className="border-line mt-5 flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="bg-accent-soft text-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold">
                    {initial}
                  </span>
                  <span className="text-ink-muted truncate text-[12.5px]">{userEmail}</span>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-danger hover:bg-danger-soft flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors"
                  >
                    <LogOut size={14} strokeWidth={1.75} />
                    Sign out
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
