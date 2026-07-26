import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";
import { signOut } from "./actions";

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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-gray-200 bg-white px-8 py-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
