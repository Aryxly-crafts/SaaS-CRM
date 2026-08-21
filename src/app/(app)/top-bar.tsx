"use client";

import Image from "next/image";
import { Bell, HelpCircle } from "lucide-react";
import { usePageTitle } from "./page-title-context";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { CommandSearch } from "@/components/command-search";
import type { WorkspaceType } from "@/lib/leads";

// Top bar: page title, global search command palette, workspace switcher, notifications, avatar.
export function TopBar({
  userEmail,
  currentMode,
}: {
  userEmail: string;
  currentMode: WorkspaceType;
}) {
  const [title] = usePageTitle();
  const initial = userEmail.charAt(0).toUpperCase() || "A";

  return (
    <header
      className="bg-surface border-line flex items-center justify-between gap-2.5 border-b px-3.5 py-2.5 sm:gap-4 sm:px-6 sm:py-3"
      style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 md:hidden">
          <Image
            src="/logo-mark.png"
            alt="Aryxly"
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
        </div>
        <h1 className="text-ink text-[16px] sm:text-headline-sm truncate font-semibold">
          {title}
        </h1>
      </div>

      <div className="mx-1 max-w-md flex-1 sm:mx-4">
        <CommandSearch placeholder="Search CRM…" />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <WorkspaceSwitcher currentMode={currentMode} variant="topbar" />

        <div className="bg-line hidden h-5 w-[1px] sm:block" />

        <button
          type="button"
          aria-label="Help"
          className="text-ink-muted hover:text-ink hover:bg-surface-muted relative hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none sm:flex"
        >
          <HelpCircle size={17} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="text-ink-muted hover:text-ink hover:bg-surface-muted relative hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none sm:flex"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>

        <span className="bg-accent-soft text-accent flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-[11px] sm:text-[12px] font-semibold flex-shrink-0">
          {initial}
        </span>
      </div>
    </header>
  );
}

