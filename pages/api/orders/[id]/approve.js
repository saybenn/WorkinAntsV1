import { supabaseAdmin } from "@/lib/supabaseServer";
// import stripe from "@/lib/stripe";
import { getSessionUser } from "@/lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).end();

  const { id } = req.query;

  // Transfer funds (connect transfer) before or after DB flip—on success, flip:
  // await stripe.transfers.create({ ... })
  const { error } = await supabaseAdmin.rpc("client_approve_order", {
    p_order: id,
  });
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
