// Stripe Connect status for the current provider
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/session";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { user } = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // Read provider row by the profile (user) id — note the app schema + snake_case columns
  const { data, error } = await supabaseAdmin
    .from("app.providers")
    .select("id, stripe_account_id, stripe_ready")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  // You can optionally ping Stripe here and update stripe_ready if needed.

  return res.status(200).json(data || {});
}
