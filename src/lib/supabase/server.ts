import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSupabaseConfig } from "./config";

// Supabase client for use in Server Components, Server Actions, and Route Handlers
export async function createClient() {
  const cookieStore = await cookies();

  const { url, key } = getSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component — safe to ignore
        }
      },
    },
  });
}

// Supabase Auth calls have no built-in timeout; without one a slow/unreachable
// auth endpoint hangs the whole render until Vercel kills the function at 25s.
const AUTH_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase auth call timed out")), ms)
    ),
  ]);
}

// Resolves the signed-in user once per request; every server component /
// server action on the same request shares this result instead of each
// making its own round-trip to Supabase Auth.
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);
    return user;
  } catch (err) {
    console.error("getAuthUser error:", err);
    return null;
  }
});
