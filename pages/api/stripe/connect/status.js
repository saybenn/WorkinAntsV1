import { supabaseAdmin } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/session";

export default async function handler(req, res) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).end();
  const { data: provider } = await supabaseAdmin
    .from("providers")
    .select("id, stripeaccountid, stripeready")
    .eq("profile_id", user.id)
    .single();
  // You can ping Stripe acct here and update stripeready
  return res.status(200).json(provider || {});
}
