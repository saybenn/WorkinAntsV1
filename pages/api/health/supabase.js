// /pages/api/health/supabase.js
import { supabaseServerClient, appDB } from "@/lib/supabaseServer";

export default async function handler(_req, res) {
  try {
    const supa = supabaseServerClient();
    const app = appDB(supa);

    const { data, error } = await app.from("profiles").select("id").limit(1);
    return res.status(200).json({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      appProfilesReadable: !error,
      error: error?.message || null,
      sample: data || [],
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
