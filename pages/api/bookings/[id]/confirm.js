import { supabaseAdmin } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).end();

  const { id } = req.query;
  const { start, end } = req.body;

  // Optionally confirm/capture PI here for in_person deposit or full capture

  const { error } = await supabaseAdmin.rpc("provider_confirm_booking", {
    p_booking: id,
    p_start: start,
    p_end: end,
  });
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
