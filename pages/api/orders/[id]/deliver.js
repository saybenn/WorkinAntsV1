import { supabaseAdmin } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).end();

  const { id } = req.query;
  const { note, files = [] } = req.body;

  // upload files to storage; insert into order_files (role='provider') server-side to bypass client tampering
  // await supabaseAdmin.from("order_files").insert(files.map(u => ({ order_id: id, role: 'provider', file_url: u })));

  const { error } = await supabaseAdmin.rpc("provider_deliver_order", {
    p_order: id,
    p_note: note || null,
  });
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
