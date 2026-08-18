"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { User, Users } from "lucide-react";
import { setWorkspaceMode } from "@/app/(app)/actions";
import type { WorkspaceType } from "@/lib/leads";

interface WorkspaceSwitcherProps {
  currentMode: WorkspaceType;
  variant?: "topbar" | "sidebar";
}

// Interactive workspace switcher with sliding active pill layout animation.
export function WorkspaceSwitcher({
  currentMode,
  variant = "topbar",
}: WorkspaceSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleSwitch = (mode: WorkspaceType) => {
    if (mode === currentMode || isPending) return;
    startTransition(async () => {
      await setWorkspaceMode(mode, pathname);
    });
  };

  if (variant === "sidebar") {
    return (
      <div className="bg-surface-muted border-line relative flex rounded-xl border p-1 shadow-inner">
        <button
          type="button"
          onClick={() => handleSwitch("personal")}
          disabled={isPending}
          className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium transition-colors ${
            currentMode === "personal" ? "text-ink" : "text-ink-muted hover:text-ink"
          } ${isPending ? "opacity-60" : ""}`}
        >
          {currentMode === "personal" && (
            <motion.div
              layoutId="activeWorkspaceSidebarPill"
              className="bg-surface absolute inset-0 rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <User size={14} className={currentMode === "personal" ? "text-accent" : ""} />
            Personal
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("team")}
          disabled={isPending}
          className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium transition-colors ${
            currentMode === "team" ? "text-ink" : "text-ink-muted hover:text-ink"
          } ${isPending ? "opacity-60" : ""}`}
        >
          {currentMode === "team" && (
            <motion.div
              layoutId="activeWorkspaceSidebarPill"
              className="bg-surface absolute inset-0 rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Users size={14} className={currentMode === "team" ? "text-accent" : ""} />
            Team
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-muted border-line relative flex items-center rounded-lg border p-0.5">
      <button
        type="button"
        onClick={() => handleSwitch("personal")}
        disabled={isPending}
        className={`relative z-10 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
          currentMode === "personal" ? "text-ink" : "text-ink-muted hover:text-ink"
        } ${isPending ? "opacity-60" : ""}`}
      >
        {currentMode === "personal" && (
          <motion.div
            layoutId="activeWorkspaceTopbarPill"
            className="bg-surface absolute inset-0 rounded-md shadow-xs"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <User size={13} className={currentMode === "personal" ? "text-accent" : ""} />
          Personal CRM
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleSwitch("team")}
        disabled={isPending}
        className={`relative z-10 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
          currentMode === "team" ? "text-ink" : "text-ink-muted hover:text-ink"
        } ${isPending ? "opacity-60" : ""}`}
      >
        {currentMode === "team" && (
          <motion.div
            layoutId="activeWorkspaceTopbarPill"
            className="bg-surface absolute inset-0 rounded-md shadow-xs"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <Users size={13} className={currentMode === "team" ? "text-accent" : ""} />
          Team Workspace
        </span>
      </button>
    </div>
  );
}
