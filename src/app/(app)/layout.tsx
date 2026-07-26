import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";
import { PageTitleProvider } from "./page-title-context";
import { TopBar } from "./top-bar";

// Shared shell for every authenticated screen: a floating app window
// containing the sidebar, top bar, and page content.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email ?? "";

  return (
    <PageTitleProvider>
      <div className="h-screen p-4 lg:p-6">
        <div className="bg-surface border-line mx-auto flex h-full max-w-[1600px] overflow-hidden rounded-[20px] border shadow-[var(--elevation-window)]">
          <Sidebar userEmail={userEmail} />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar userEmail={userEmail} />
            <main className="flex-1 overflow-y-auto p-5">{children}</main>
          </div>
        </div>
      </div>
    </PageTitleProvider>
  );
}
