import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";
import { PageTitleProvider } from "./page-title-context";
import { TopBar } from "./top-bar";

// Shared shell for every authenticated screen: sidebar + top bar.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PageTitleProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar userEmail={user?.email ?? ""} />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
