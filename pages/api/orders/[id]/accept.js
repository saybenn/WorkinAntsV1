import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).end();

  const { id } = req.query;

  // Optional: confirm Stripe PI here for digital or when booking is confirmed for in_person.

  // DB transition
  const { error } = await supabaseAdmin.rpc("provider_accept_order", {
    p_order: id,
  });
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
