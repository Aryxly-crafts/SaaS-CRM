import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { calculatePriorityScore, type LeadStatus } from "@/lib/leads";

interface IncomingLead {
  business_name: string;
  category?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: LeadStatus;
  notes?: string | null;
  source?: string | null;
  estimated_value?: number | null;
}

// Ingest is server-to-server, so no browser origin is trusted by default.
// Set INGEST_ALLOWED_ORIGIN only if something genuinely calls this from a page.
function corsHeaders() {
  const origin = process.env.INGEST_ALLOWED_ORIGIN?.trim();
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// Strips formatting so "+91 98450 12345" and "9845012345" compare as one number.
function normalisePhone(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, "") ?? "";
  // Keep the last 10 digits so a country-code prefix never defeats the match.
  return digits.length >= 10 ? digits.slice(-10) : digits || null;
}

// Reads a value that may arrive as a formatted string, e.g. "1,20,000".
function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

// Quotes a value for a PostgREST in.() list, escaping any embedded double quote.
function quoteForFilter(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

// POST /api/leads/ingest — accepts leads from the Maps Scraper.
// Writes with the service role key, because RLS grants `leads` only to
// authenticated users and this request carries no user session.
export async function POST(req: Request) {
  const headers = corsHeaders();

  try {
    const configuredKey = process.env.INGEST_API_KEY?.trim();
    // An unset key used to mean "no auth", which silently left the endpoint open.
    if (!configuredKey) {
      return NextResponse.json(
        { success: false, error: "Ingest is disabled: INGEST_API_KEY is not configured." },
        { status: 503, headers },
      );
    }

    const presented =
      req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
    if (presented !== configuredKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: invalid or missing API key." },
        { status: 401, headers },
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!serviceKey) {
      // Falling back to the anon key would be blocked by RLS on every row while
      // still reporting success, so refuse loudly rather than lie.
      return NextResponse.json(
        { success: false, error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is not set." },
        { status: 503, headers },
      );
    }

    const body = await req.json();
    const rawLeads: IncomingLead[] = Array.isArray(body)
      ? body
      : Array.isArray(body.leads)
        ? body.leads
        : [body];

    const candidates = rawLeads.filter((lead) => lead?.business_name?.trim());
    if (!candidates.length) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: every lead needs a business_name." },
        { status: 400, headers },
      );
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { persistSession: false },
    });

    // Compare only against leads that could actually collide. Fetching the whole
    // table hit PostgREST's default 1000-row cap, which quietly broke dedupe as
    // the table grew; this scopes the lookup to the incoming batch instead.
    const names = [...new Set(candidates.map((l) => l.business_name.trim()))];
    const phones = [...new Set(candidates.map((l) => l.phone).filter(Boolean))] as string[];
    const orFilter = [
      `business_name.in.(${names.map(quoteForFilter).join(",")})`,
      ...(phones.length ? [`phone.in.(${phones.map(quoteForFilter).join(",")})`] : []),
    ].join(",");

    const { data: existingRows, error: lookupError } = await supabase
      .from("leads")
      .select("business_name, phone")
      .or(orFilter);

    if (lookupError) {
      return NextResponse.json(
        { success: false, error: `Duplicate check failed: ${lookupError.message}` },
        { status: 500, headers },
      );
    }

    const existingPhones = new Set(
      (existingRows ?? []).map((r) => normalisePhone(r.phone)).filter(Boolean) as string[],
    );
    const existingNames = new Set(
      (existingRows ?? [])
        .map((r) => r.business_name?.toLowerCase().trim())
        .filter(Boolean) as string[],
    );

    const allowDuplicates = body?.allowDuplicates === true;
    const records: Record<string, unknown>[] = [];
    const duplicatePhones: string[] = [];
    let duplicatesSkipped = 0;

    for (const item of candidates) {
      const cleanName = item.business_name.trim();
      const cleanPhone = item.phone?.trim() || null;
      const normalised = normalisePhone(cleanPhone);

      const isDuplicate =
        (normalised && existingPhones.has(normalised)) ||
        existingNames.has(cleanName.toLowerCase());

      if (isDuplicate && !allowDuplicates) {
        duplicatesSkipped++;
        // Reported back so the scraper can retire a lead the CRM already holds.
        if (cleanPhone) duplicatePhones.push(cleanPhone);
        continue;
      }

      const status: LeadStatus = item.status || "cold";
      const estimated_value = toNumber(item.estimated_value);
      const created_at = new Date().toISOString();

      records.push({
        business_name: cleanName,
        category: item.category || null,
        phone: cleanPhone,
        address: item.address || null,
        status,
        notes: item.notes || null,
        source: item.source || "Maps Scraper",
        estimated_value,
        priority_score: calculatePriorityScore({
          phone: cleanPhone,
          status,
          estimated_value,
          created_at,
        }),
        // Scraped leads are agency pipeline. A personal row needs a user_id to
        // satisfy RLS, and a server-side push has no session to take one from,
        // so it would insert a row that nobody can read.
        workspace_type: "team",
        created_at,
      });

      // Guard against the same lead appearing twice inside a single payload.
      if (normalised) existingPhones.add(normalised);
      existingNames.add(cleanName.toLowerCase());
    }

    // One round trip for the whole batch rather than one insert per lead.
    let inserted: { phone: string | null }[] = [];
    if (records.length) {
      const { data, error } = await supabase.from("leads").insert(records).select("phone");
      if (error) {
        return NextResponse.json(
          { success: false, error: `Insert failed: ${error.message}` },
          { status: 500, headers },
        );
      }
      inserted = data ?? [];
    }

    revalidatePath("/leads");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        message: `Inserted ${inserted.length} leads (${duplicatesSkipped} duplicates skipped).`,
        insertedCount: inserted.length,
        duplicatesSkipped,
        duplicatePhones,
        inserted,
      },
      { headers },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500, headers },
    );
  }
}
