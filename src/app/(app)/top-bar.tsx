"use client";

import { usePageTitle } from "./page-title-context";

// Top bar showing only the current page's title, per the minimalism constraint.
export function TopBar() {
  const [title] = usePageTitle();
  return (
    <header className="border-b border-slate-200 bg-white px-8 py-5">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
    </header>
  );
}
