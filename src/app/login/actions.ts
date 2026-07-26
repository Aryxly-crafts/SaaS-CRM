"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Signs a user in with email/password; no signup path exists on purpose.
export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}
