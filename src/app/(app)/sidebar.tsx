"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Wallet,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "./actions";

const PRIMARY_NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
];

const WORK_NAV = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/documents", label: "Documents", icon: FileText },
];

// True when the given href is the section currently being viewed.
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// A single sidebar link with an animated active pill behind it.
function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Users;
  active: boolean;
}) {
  return (
    <li className="relative">
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="bg-surface absolute inset-0 rounded-[10px] shadow-[var(--elevation-card)]"
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
        />
      )}
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative z-10 flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none ${
          active
            ? "text-ink font-medium"
            : "text-ink-muted hover:text-ink font-normal"
        }`}
      >
        <Icon
          size={17}
          strokeWidth={1.75}
          className={active ? "text-accent" : "text-ink-subtle"}
        />
        {label}
      </Link>
    </li>
  );
}

// Left navigation — grouped sections, animated active state, account footer.
export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const initial = userEmail.charAt(0).toUpperCase() || "A";

  return (
    <nav className="bg-canvas border-line scroll-hidden hidden w-[228px] flex-shrink-0 flex-col overflow-y-auto border-r px-3 py-5 md:flex">
      <div className="mb-7 flex items-center gap-2 px-2">
        <Image
          src="/logo-mark.png"
          alt=""
          width={30}
          height={30}
          priority
          className="h-[30px] w-[30px] object-contain"
        />
        <span className="text-ink text-[15px] font-semibold tracking-tight">
          Arylxy
        </span>
      </div>

      <ul className="flex flex-col gap-0.5">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(pathname, item.href)}
          />
        ))}
      </ul>

      <p className="text-ink-subtle mt-6 mb-1.5 px-3 text-[10px] font-semibold tracking-[0.08em] uppercase">
        Workspace
      </p>
      <ul className="flex flex-col gap-0.5">
        {WORK_NAV.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(pathname, item.href)}
          />
        ))}
      </ul>

      <div className="flex-1" />

      <ul className="flex flex-col gap-0.5">
        <NavLink
          href="/settings"
          label="Settings"
          icon={Settings}
          active={isActive(pathname, "/settings")}
        />
      </ul>

      <div className="border-line mt-3 flex items-center gap-2.5 border-t px-2 pt-3">
        <span className="bg-accent-soft text-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold">
          {initial}
        </span>
        <span className="text-ink-muted min-w-0 flex-1 truncate text-[12px]">
          {userEmail}
        </span>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="text-ink-subtle hover:text-ink hover:bg-line flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
          >
            <LogOut size={15} strokeWidth={1.75} />
          </button>
        </form>
      </div>
    </nav>
  );
}
