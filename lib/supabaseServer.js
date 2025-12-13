// Server-side Supabase clients (Node-only)
import { createClient } from "@supabase/supabase-js";

/**
 * Admin client (Service Role): bypasses RLS.
 * NEVER expose SERVICE_ROLE to the browser.
 */
export const supabaseAdmin = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE credentials: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE"
    );
  }
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
})();

/**
 * As-user server client. Pass a user's JWT so RLS sees auth.uid().
 * Use this in API routes when you want RLS enforcement.
 */

// v2-compatible server client (optionally as end user via Bearer)

export function supabaseServerClient(userToken) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // bypasses RLS
  if (!url || !anon) throw new Error("Missing SUPABASE envs");
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Helper: scope a client to the `app` schema for tables/RPC
export function appAdmin(db) {
  return db.schema("app");
}
