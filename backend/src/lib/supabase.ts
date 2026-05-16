/* eslint-disable @typescript-eslint/no-explicit-any --
 * Prefer tightening with `Database` generics from Supabase codegen when available.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminSingleton: SupabaseClient<any> | undefined;

export function getSupabaseAdmin(): SupabaseClient<any> {
  if (adminSingleton) {
    return adminSingleton;
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not set.");
  }

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  adminSingleton = createClient<any>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminSingleton;
}
