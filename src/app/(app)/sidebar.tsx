"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/projects", label: "Projects" },
  { href: "/payments", label: "Payments" },
  { href: "/documents", label: "Documents" },
  { href: "/settings", label: "Settings" },
];

// Left navigation — highlights the active section by path.
export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-56 flex-col border-r border-gray-200 bg-white px-4 py-6">
      <div className="mb-8 px-2 text-lg font-semibold text-gray-900">
        Arylxy
      </div>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
