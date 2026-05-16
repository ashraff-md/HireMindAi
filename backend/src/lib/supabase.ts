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
    throw new Error(
      "SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not set. Add it to backend/.env.local (same project URL as the frontend), then restart the backend.",
    );
  }

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. In Supabase Dashboard → Project Settings → API, copy the secret service_role key into backend/.env.local as SUPABASE_SERVICE_ROLE_KEY=... (never commit this file), then restart the backend on port 3001.",
    );
  }

  adminSingleton = createClient<any>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminSingleton;
}
