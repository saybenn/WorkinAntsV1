import { supabaseAdmin } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/session";
// import stripe from "@/lib/stripe";

export default async function handler(req, res) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).end();

  // Ensure provider exists
  const { data: provider } = await supabaseAdmin
    .from("providers")
    .select("id, stripeaccountid")
    .eq("profile_id", user.id)
    .single();

  // Create account + link (pseudo)
  // const accountId = provider?.stripeaccountid ?? (await stripe.accounts.create({ type:"express" })).id;
  // const link = await stripe.accountLinks.create({ account: accountId, refresh_url:..., return_url:..., type:"account_onboarding" });

  // Persist new accountId if created…
  // await supabaseAdmin.from("providers").update({ stripeaccountid: accountId }).eq("id", provider.id);

  // For demo, just bounce back to dashboard:
  res.redirect(
    302,
    `/u/${user.user_metadata?.handle || "me"}/dashboard?as=provider`
  );
}
