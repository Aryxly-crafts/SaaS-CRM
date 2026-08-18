import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace";
import { Sidebar } from "./sidebar";
import { PageTitleProvider } from "./page-title-context";
import { TopBar } from "./top-bar";
import { PageTransition } from "./page-transition";
import { RealtimeListener } from "@/components/realtime-listener";

// Shared shell for every authenticated screen: sidebar, top bar, and a
// scrolling content column that fills the viewport edge to edge.
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

  const ctx = await getWorkspaceContext();

  return (
    <PageTitleProvider>
      <div className="bg-surface flex h-screen overflow-hidden">
        <Sidebar userEmail={userEmail} currentMode={ctx.mode} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar userEmail={userEmail} currentMode={ctx.mode} />
          <main className="scroll-hidden flex-1 overflow-y-auto px-6 py-5">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
      <RealtimeListener />
    </PageTitleProvider>
  );
}
