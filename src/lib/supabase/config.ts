const COPY_PASTE_PREFIX = /^[\s"'`“”‘’•·‣▪◦]+/u;

// Removes formatting characters that can be copied into environment values with credentials.
function cleanEnvironmentValue(value: string | undefined, name: string): string {
  const cleaned = value?.replace(COPY_PASTE_PREFIX, "").trim();

  if (!cleaned) {
    throw new Error(
      `Missing ${name}. Add it to .env.local or your Vercel project environment variables.`,
    );
  }

  if (!/^[\u0000-\u00ff]*$/u.test(cleaned)) {
    throw new Error(
      `${name} contains an unsupported character. Re-copy the value without bullets or smart quotes.`,
    );
  }

  return cleaned;
}

// Reads and validates the public Supabase configuration used by every client.
export function getSupabaseConfig() {
  return {
    url: cleanEnvironmentValue(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    key: cleanEnvironmentValue(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
  };
}
