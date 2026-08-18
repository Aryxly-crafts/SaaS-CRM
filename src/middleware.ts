import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Router prefetches only warm the cache — they never render a page for the
  // user, so skip the session check and let the real navigation handle auth.
  if (request.headers.get("next-router-prefetch") === "1") {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except Next internals, static assets, and the machine ingest
    // endpoint. Ingest authenticates with its own API key, so a cookie session
    // is the wrong gate for it — this matcher was redirecting the scraper's
    // server-to-server push to /login.
    "/((?!_next/static|_next/image|favicon.ico|logo-mark.png|api/leads/ingest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
