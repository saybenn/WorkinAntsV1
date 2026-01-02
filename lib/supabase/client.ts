// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Full client (auth + db)
export const supabase: SupabaseClient = createBrowserClient(url, anon);

// App-scoped DB helper (db only)
export const appDb = supabase.schema("app");
