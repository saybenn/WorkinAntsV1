// /pages/api/provider/ensure.js
import { supabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/session";

export default async function handler(req, res) {
  // 1) Who's calling?
  const { user, token } = await getSessionUser(req);
  if (!user || !token) return res.status(401).json({ error: "Unauthorized" });

  const db = supabaseServerClient(token); // acts AS this user (RLS aware)

  // 2) Find provider tied to this user
  const { data: provider, error: findErr } = await db
    .from("providers")
    .select("id, slug, display_name, isapproved, stripeready")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (findErr) return res.status(400).json({ error: findErr.message });
  if (provider) return res.status(200).json(provider);

  // 3) Create minimal provider (RLS allows insert because profile_id = auth.uid())
  const slugBase =
    user.user_metadata?.handle ||
    user.user_metadata?.username ||
    user.email?.split("@")[0] ||
    `prov_${user.id.slice(0, 6)}`;

  const { data: created, error: insErr } = await db
    .from("providers")
    .insert({
      profile_id: user.id, // 🔑 passes providers_owner_rw policy
      slug: slugBase.toLowerCase(),
      display_name: user.user_metadata?.fullName || slugBase,
      isapproved: true, // demo-friendly; gate in prod if needed
    })
    .select("id, slug, display_name, isapproved, stripeready")
    .single();

  if (insErr) return res.status(400).json({ error: insErr.message });

  return res.status(200).json(created);
}
