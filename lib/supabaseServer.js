// Server-side Supabase clients (Node-only)
import { createClient } from "@supabase/supabase-js";

/**
 * Admin client (Service Role): bypasses RLS.
 * NEVER expose SERVICE_ROLE to the browser.
 */
export const supabaseAdmin = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
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
export function supabaseServerClient(userToken) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: userToken ? { Authorization: `Bearer ${userToken}` } : {},
    },
  });
}
