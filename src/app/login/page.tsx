import { login } from "./actions";

// Simple email/password gate — no signup link, only 2 accounts ever exist.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-semibold text-gray-900">Arylxy</h1>
        <p className="mb-6 text-sm text-gray-500">Lead & Project Tracker</p>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
        />

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
