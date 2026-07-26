import Image from "next/image";
import { AlertCircle, LogIn } from "lucide-react";
import { login } from "./actions";
import { SkyField } from "./sky-field";

// Sign-in gate — no signup link, only the two founder accounts exist.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <SkyField />

      {/* Brand mark, top left, like the reference. */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image
          src="/logo-mark.png"
          alt=""
          width={26}
          height={26}
          priority
          className="h-[26px] w-[26px] object-contain drop-shadow-sm"
        />
        <span className="text-[15px] font-semibold tracking-tight text-white drop-shadow-sm">
          Arylxy
        </span>
      </div>

      <div className="relative w-full max-w-[340px]">
        <form
          action={login}
          className="rounded-[22px] border border-white/60 bg-white/25 p-7 shadow-[0_20px_60px_-16px_rgba(42,64,96,0.35)] backdrop-blur-2xl"
        >
          <div className="mb-5 flex flex-col items-center text-center">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/70 bg-white/70 shadow-sm backdrop-blur">
              <LogIn size={18} strokeWidth={2} className="text-ink" />
            </span>
            <h1 className="text-ink text-[19px] font-semibold tracking-tight">
              Sign in with email
            </h1>
            <p className="text-ink-muted mt-1.5 text-[12.5px] leading-relaxed">
              Track leads, projects, and payments
              <br />
              in one place.
            </p>
          </div>

          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            className="text-ink placeholder:text-ink-muted mb-2.5 w-full rounded-[11px] border border-white/60 bg-white/55 px-3.5 py-2.5 text-[13px] transition-colors outline-none focus:border-white focus:bg-white/85"
          />

          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="text-ink placeholder:text-ink-muted w-full rounded-[11px] border border-white/60 bg-white/55 px-3.5 py-2.5 text-[13px] transition-colors outline-none focus:border-white focus:bg-white/85"
          />

          {error && (
            <p
              role="alert"
              className="text-danger mt-3 flex items-start gap-1.5 text-[12px]"
            >
              <AlertCircle
                size={14}
                strokeWidth={2}
                className="mt-px flex-shrink-0"
              />
              {error}
            </p>
          )}

          <button
            type="submit"
            className="bg-ink mt-4 w-full cursor-pointer rounded-[11px] py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-88 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Sign in
          </button>

          <p className="text-ink-muted mt-4 text-center text-[11px]">
            Internal tool — Arylxy founders only.
          </p>
        </form>
      </div>
    </div>
  );
}
