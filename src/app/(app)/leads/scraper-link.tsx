import { ExternalLink } from "lucide-react";

const SCRAPER_URL = "https://aryxly-scrapper.vercel.app/";

// Points at the scraper, which now pushes leads here directly. Pasting JSON by
// hand is gone: leads arrive over the pipeline and appear live via Realtime.
export function ScraperLink() {
  return (
    <a
      href={SCRAPER_URL}
      target="_blank"
      rel="noreferrer"
      className="border-line text-ink hover:border-accent hover:text-accent flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
    >
      Find leads in Scraper
      <ExternalLink size={12} strokeWidth={2} />
    </a>
  );
}
