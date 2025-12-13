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

// curl -i \
//   -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcXhvaWh4bHF0eGVnZWVmbWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Nzk1MzcsImV4cCI6MjA3NTQ1NTUzN30.2mleX93RNPSroNZlNY9h9rhbeUEV6rst-7N_IAjylrc" \
//   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcXhvaWh4bHF0eGVnZWVmbWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Nzk1MzcsImV4cCI6MjA3NTQ1NTUzN30.2mleX93RNPSroNZlNY9h9rhbeUEV6rst-7N_IAjylrc" \
//   -d '{"p_id":"00000000-0000-0000-0000-000000000000"}' \
//   "https://ppqxoihxlqtxegeefmet.supabase.co/rest/v1/app.profiles?select=id&limit=1"
