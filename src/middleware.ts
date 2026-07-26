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
    // Everything except Next internals, the favicon, and static assets.
    "/((?!_next/static|_next/image|favicon.ico|logo-mark.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
