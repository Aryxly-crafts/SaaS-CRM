import { Hexagon, AlertCircle } from "lucide-react";
import { login } from "./actions";

// Sign-in gate — no signup link, only the two founder accounts exist.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="bg-accent flex h-11 w-11 items-center justify-center rounded-[14px] text-white shadow-[var(--elevation-card-hover)]">
            <Hexagon size={22} strokeWidth={2.25} fill="currentColor" />
          </span>
          <div>
            <h1 className="text-ink text-[19px] font-semibold tracking-tight">
              Sign in to Arylxy
            </h1>
            <p className="text-ink-muted mt-1 text-[13px]">
              Lead &amp; project tracker
            </p>
          </div>
        </div>

        <form
          action={login}
          className="bg-surface border-line rounded-[18px] border p-6 shadow-[var(--elevation-window)]"
        >
          <label
            htmlFor="email"
            className="text-ink mb-1.5 block text-[12.5px] font-medium"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@arylxy.com"
            className="border-line bg-surface-muted text-ink placeholder:text-ink-subtle focus:border-accent focus:bg-surface mb-4 w-full rounded-[10px] border px-3 py-2.5 text-[13px] transition-colors focus:ring-2 focus:ring-[var(--accent)]/15 focus:outline-none"
          />

          <label
            htmlFor="password"
            className="text-ink mb-1.5 block text-[12.5px] font-medium"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="border-line bg-surface-muted text-ink placeholder:text-ink-subtle focus:border-accent focus:bg-surface w-full rounded-[10px] border px-3 py-2.5 text-[13px] transition-colors focus:ring-2 focus:ring-[var(--accent)]/15 focus:outline-none"
          />

          {error && (
            <p
              role="alert"
              className="text-accent mt-3 flex items-start gap-1.5 text-[12px]"
            >
              <AlertCircle size={14} strokeWidth={2} className="mt-px flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover mt-5 w-full cursor-pointer rounded-[10px] py-2.5 text-[13px] font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Sign in
          </button>
        </form>

        <p className="text-ink-subtle mt-5 text-center text-[11.5px]">
          Internal tool — access is limited to Arylxy founders.
        </p>
      </div>
    </div>
  );
}
