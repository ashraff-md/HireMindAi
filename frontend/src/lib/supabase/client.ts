import { createBrowserClient } from "@supabase/ssr";

/** Public anon/JWT-style key preferred; newer Supabase setups may only expose publishable keys. */
function resolveSupabasePublicKey(): string {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (anon) return anon;
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
}

export function isSupabaseBrowserConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  return Boolean(url && resolveSupabasePublicKey());
}

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = resolveSupabasePublicKey();

  if (!url || !key) {
    return null;
  }

  return createBrowserClient(url, key);
}
