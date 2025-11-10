// v2-compatible server client that acts AS the end user via Bearer header
import { createClient } from "@supabase/supabase-js";

export function supabaseServerClient(userToken) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Important: inject the user's access token so RLS sees auth.uid()
  return createClient(supabaseUrl, supabaseAnonKey, {
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
