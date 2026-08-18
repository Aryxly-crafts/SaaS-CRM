import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { calculatePriorityScore, type LeadStatus, type WorkspaceType } from "@/lib/leads";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface IncomingLead {
  business_name: string;
  category?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: LeadStatus;
  notes?: string | null;
  source?: string | null;
  estimated_value?: number | null;
  workspace_type?: WorkspaceType;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// POST /api/leads/ingest — Ingestion endpoint for Maps Scraper and external automations.
export async function POST(req: Request) {
  try {
    // Optional API key validation if INGEST_API_KEY is configured
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const configuredKey = process.env.INGEST_API_KEY;
    if (configuredKey && apiKey !== configuredKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const rawLeads: IncomingLead[] = Array.isArray(body)
      ? body
      : Array.isArray(body.leads)
      ? body.leads
      : [body];

    if (!rawLeads.length || !rawLeads[0].business_name) {
      return NextResponse.json(
        { success: false, error: "Invalid payload. Provide a lead object or array of leads with 'business_name'." },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch existing phone numbers and business names in target workspace for deduplication
    const defaultWorkspace = (body.workspace_type as WorkspaceType) || "team";
    const { data: existingRows } = await supabase
      .from("leads")
      .select("business_name, phone");

    const existingPhones = new Set(
      (existingRows ?? [])
        .map((r) => r.phone?.replace(/\D/g, ""))
        .filter(Boolean)
    );
    const existingNames = new Set(
      (existingRows ?? [])
        .map((r) => r.business_name?.toLowerCase().trim())
        .filter(Boolean)
    );

    const inserted: any[] = [];
    let duplicatesSkipped = 0;

    for (const item of rawLeads) {
      const cleanName = (item.business_name || "").trim();
      if (!cleanName) continue;

      const cleanPhone = item.phone ? item.phone.trim() : null;
      const normalizedPhone = cleanPhone ? cleanPhone.replace(/\D/g, "") : null;

      // Deduplication check
      const isDuplicate =
        (normalizedPhone && existingPhones.has(normalizedPhone)) ||
        existingNames.has(cleanName.toLowerCase());

      if (isDuplicate && !body.allowDuplicates) {
        duplicatesSkipped++;
        continue;
      }

      const status: LeadStatus = item.status || "cold";
      const estimated_value =
        typeof item.estimated_value === "number"
          ? item.estimated_value
          : item.estimated_value
          ? Number(String(item.estimated_value).replace(/,/g, ""))
          : null;
      const created_at = new Date().toISOString();

      const priority_score = calculatePriorityScore({
        phone: cleanPhone,
        status,
        estimated_value,
        created_at,
      });

      const leadRecord = {
        business_name: cleanName,
        category: item.category || null,
        phone: cleanPhone,
        address: item.address || null,
        status,
        notes: item.notes || null,
        source: item.source || "Google Maps Scraper",
        estimated_value,
        priority_score,
        workspace_type: item.workspace_type || defaultWorkspace,
        created_at,
      };

      const { data, error } = await supabase
        .from("leads")
        .insert(leadRecord)
        .select()
        .single();

      if (!error && data) {
        inserted.push(data);
        if (normalizedPhone) existingPhones.add(normalizedPhone);
        existingNames.add(cleanName.toLowerCase());
      }
    }

    // Revalidate CRM views
    revalidatePath("/leads");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        message: `Ingestion complete. Inserted ${inserted.length} leads. (${duplicatesSkipped} duplicates skipped)`,
        insertedCount: inserted.length,
        duplicatesSkipped,
        inserted,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
