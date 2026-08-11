"use client";

import { useTransition } from "react";
import { User, Users } from "lucide-react";
import { setWorkspaceMode } from "@/app/(app)/actions";
import type { WorkspaceType } from "@/lib/leads";

interface WorkspaceSwitcherProps {
  currentMode: WorkspaceType;
  variant?: "topbar" | "sidebar";
}

export function WorkspaceSwitcher({
  currentMode,
  variant = "topbar",
}: WorkspaceSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (mode: WorkspaceType) => {
    if (mode === currentMode || isPending) return;
    startTransition(async () => {
      await setWorkspaceMode(mode);
    });
  };

  if (variant === "sidebar") {
    return (
      <div className="bg-surface-muted border-line flex rounded-xl border p-1 shadow-inner">
        <button
          type="button"
          onClick={() => handleSwitch("personal")}
          disabled={isPending}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium transition-all ${
            currentMode === "personal"
              ? "bg-surface text-ink shadow-[var(--elevation-card)]"
              : "text-ink-muted hover:text-ink"
          } ${isPending ? "opacity-60" : ""}`}
        >
          <User size={14} className={currentMode === "personal" ? "text-accent" : ""} />
          Personal
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("team")}
          disabled={isPending}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium transition-all ${
            currentMode === "team"
              ? "bg-surface text-ink shadow-[var(--elevation-card)]"
              : "text-ink-muted hover:text-ink"
          } ${isPending ? "opacity-60" : ""}`}
        >
          <Users size={14} className={currentMode === "team" ? "text-accent" : ""} />
          Team
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-muted border-line flex items-center rounded-lg border p-0.5">
      <button
        type="button"
        onClick={() => handleSwitch("personal")}
        disabled={isPending}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all ${
          currentMode === "personal"
            ? "bg-surface text-ink shadow-sm"
            : "text-ink-muted hover:text-ink"
        } ${isPending ? "opacity-60" : ""}`}
      >
        <User size={13} className={currentMode === "personal" ? "text-accent" : ""} />
        Personal CRM
      </button>

      <button
        type="button"
        onClick={() => handleSwitch("team")}
        disabled={isPending}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all ${
          currentMode === "team"
            ? "bg-surface text-ink shadow-sm"
            : "text-ink-muted hover:text-ink"
        } ${isPending ? "opacity-60" : ""}`}
      >
        <Users size={13} className={currentMode === "team" ? "text-accent" : ""} />
        Team Workspace
      </button>
    </div>
  );
}
