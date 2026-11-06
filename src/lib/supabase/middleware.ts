import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

// Supabase Auth calls have no built-in timeout; without one a slow/unreachable
// auth endpoint hangs the whole request until Vercel kills the function at 25s.
const AUTH_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase auth call timed out")), ms)
    ),
  ]);
}

// Verifies the session on every request and redirects signed-out users to /login.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  let config: ReturnType<typeof getSupabaseConfig>;
  try {
    config = getSupabaseConfig();
  } catch (err) {
    console.error("Supabase configuration error:", err);
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(config.url, config.key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);
    const signedIn = Boolean(user);

    if (!signedIn && request.nextUrl.pathname !== "/login") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    if (signedIn && request.nextUrl.pathname === "/login") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
  } catch (err) {
    console.error("Middleware auth error:", err);
  }

  return supabaseResponse;
}
