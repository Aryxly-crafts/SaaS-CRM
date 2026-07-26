"use client";

import { createContext, useContext, useEffect, useState } from "react";

const PageTitleContext = createContext<
  [string, (title: string) => void] | null
>(null);

// Wraps the authenticated shell so any page can set the top bar's title.
export function PageTitleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = useState("Dashboard");
  return (
    <PageTitleContext.Provider value={state}>
      {children}
    </PageTitleContext.Provider>
  );
}

// Reads the current top bar title and its setter.
export function usePageTitle() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error("usePageTitle must be used within PageTitleProvider");
  return ctx;
}

// Renders nothing — a page mounts this once to set the top bar's title.
export function SetPageTitle({ title }: { title: string }) {
  const [, setTitle] = usePageTitle();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
  return null;
}
