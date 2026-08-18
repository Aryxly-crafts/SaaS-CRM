"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceType } from "@/lib/leads";

// Signs the current user out and returns to the login screen.
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Switches active workspace mode and revalidates the current route without nuking the layout.
export async function setWorkspaceMode(mode: WorkspaceType, currentPath: string = "/") {
  const cookieStore = await cookies();
  cookieStore.set("workspace_mode", mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  if (currentPath && currentPath !== "/") {
    revalidatePath(currentPath);
  }
  revalidatePath("/");
}
