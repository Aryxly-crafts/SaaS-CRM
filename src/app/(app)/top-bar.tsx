"use client";

import { Search, Bell } from "lucide-react";
import { usePageTitle } from "./page-title-context";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import type { WorkspaceType } from "@/lib/leads";

// Top bar: page title, global search affordance, workspace switcher, notifications, avatar.
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
    <header className="border-line flex items-center gap-4 border-b px-6 py-3.5">
      <h1 className="text-ink text-[15px] font-semibold tracking-tight">
        {title}
      </h1>

      <div className="relative ml-2 max-w-sm flex-1">
        <Search
          size={15}
          strokeWidth={1.75}
          className="text-ink-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          type="search"
          placeholder="Search leads, projects, clients…"
          className="border-line bg-surface-muted text-ink placeholder:text-ink-subtle focus:border-line-strong focus:bg-surface w-full rounded-[10px] border py-2 pr-3 pl-9 text-[13px] transition-colors focus:ring-2 focus:ring-[var(--accent)]/15 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <WorkspaceSwitcher currentMode={currentMode} variant="topbar" />

        <div className="bg-line h-4 w-[1px]" />

        <button
          type="button"
          aria-label="Notifications"
          className="text-ink-muted hover:text-ink hover:bg-surface-muted relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
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
