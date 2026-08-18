"use client";

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
    <header className="bg-surface border-line flex items-center gap-4 border-b px-6 py-3">
      <h1 className="text-ink text-headline-sm whitespace-nowrap">
        {title}
      </h1>

      <div className="ml-4 max-w-md flex-1">
        <CommandSearch />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <WorkspaceSwitcher currentMode={currentMode} variant="topbar" />

        <div className="bg-line h-5 w-[1px]" />

        <button
          type="button"
          aria-label="Help"
          className="text-ink-muted hover:text-ink hover:bg-surface-muted relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
        >
          <HelpCircle size={17} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="text-ink-muted hover:text-ink hover:bg-surface-muted relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>

        <span className="bg-accent-soft text-accent flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold">
          {initial}
        </span>
      </div>
    </header>
  );
}
