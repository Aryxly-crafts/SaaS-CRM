"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

// Sign-in button that shows a spinner and locks while the form is submitting.
export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="bg-ink mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[11px] py-2.5 text-[13px] font-medium text-white transition-all hover:opacity-88 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && (
        <Loader2 size={14} strokeWidth={2.25} className="animate-spin" />
      )}
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
