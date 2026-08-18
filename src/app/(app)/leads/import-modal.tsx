"use client";

import { useState, useTransition } from "react";
import { Download, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, TextareaField, SelectField } from "@/components/ui";

export function ImportLeadsModal() {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [workspace, setWorkspace] = useState("team");
  const [statusMsg, setStatusMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const handleImport = () => {
    setStatusMsg(null);
    if (!jsonText.trim()) {
      setStatusMsg({ text: "Please paste JSON or CSV text from the scraper.", error: true });
      return;
    }

    startTransition(async () => {
      try {
        let payload: any = [];
        const raw = jsonText.trim();

        if (raw.startsWith("[") || raw.startsWith("{")) {
          payload = JSON.parse(raw);
        } else {
          // Simple CSV parser
          const lines = raw.split("\n").filter((l) => l.trim());
          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
          payload = lines.slice(1).map((line) => {
            const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => {
              obj[h] = cols[i] || "";
            });
            return {
              business_name: obj.name || obj.business_name || obj.title || cols[0],
              category: obj.category || obj.type || cols[1] || null,
              phone: obj.phone || obj.phone_number || cols[2] || null,
              address: obj.address || cols[3] || null,
              notes: obj.notes || (obj.website ? `Website: ${obj.website}` : null),
              source: "Google Maps Scraper",
            };
          });
        }

        const res = await fetch("/api/leads/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspace_type: workspace,
            leads: Array.isArray(payload) ? payload : [payload],
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMsg({
            text: `✅ Imported ${data.insertedCount} leads successfully! (${data.duplicatesSkipped} duplicates skipped)`,
            error: false,
          });
          setJsonText("");
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setStatusMsg({ text: data.error || "Failed to import leads", error: true });
        }
      } catch (err: any) {
        setStatusMsg({ text: `Invalid format: ${err.message}`, error: true });
      }
    });
  };

  return (
    <>
      <Button
        variant="secondary"
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5"
      >
        <Download size={13} strokeWidth={2} />
        Import from Scraper
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Import Leads from Scraper"
        description="Paste JSON or CSV data exported from the Aryxly Maps Scraper."
      >
        <div className="flex flex-col gap-3.5">
          <div className="bg-surface-muted border-line flex items-center justify-between rounded-lg border p-2.5 text-[12px]">
            <span className="text-ink flex items-center gap-1.5 font-medium">
              <Sparkles size={14} className="text-accent" />
              Aryxly Maps Scraper
            </span>
            <a
              href="https://aryxly-scrapper.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline flex items-center gap-1 font-medium"
            >
              Open Scraper <ExternalLink size={11} />
            </a>
          </div>

          <SelectField
            label="Destination Workspace"
            name="workspace_type"
            options={[
              { value: "team", label: "Team Workspace (Agency Pipeline)" },
              { value: "personal", label: "Personal CRM (Founder Private)" },
            ]}
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
          />

          <div>
            <label className="text-ink mb-1.5 block text-[12.5px] font-medium">
              Scraper Output (JSON or CSV)
            </label>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[\n  {\n    "business_name": "Apex Dental Studio",\n    "category": "Dentist",\n    "phone": "+91 98450 12345",\n    "address": "Indiranagar, Bangalore",\n    "notes": "No website found on Maps"\n  }\n]`}
              className="border-line bg-surface-muted text-ink placeholder:text-ink-subtle focus:border-accent focus:bg-surface w-full resize-y rounded-lg border px-3 py-2 font-mono text-[11.5px] transition-colors focus:ring-2 focus:ring-[var(--accent)]/15 focus:outline-none"
            />
          </div>

          {statusMsg && (
            <p
              role="alert"
              className={`text-[12px] font-medium ${
                statusMsg.error ? "text-danger" : "text-positive"
              }`}
            >
              {statusMsg.text}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={handleImport} disabled={pending}>
              {pending && <Loader2 size={13} strokeWidth={2.25} className="animate-spin" />}
              Import Leads
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
