import { supabaseAdmin } from "@/lib/supabaseServer"; // service role key
import { getSessionUser } from "@/lib/session"; // your helper

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).end();

  const { type, providerId, providerServiceId, priceCents, brief, booking } =
    req.body;

  // 1) Create order in 'awaiting_provider' (PaymentIntent created server-side; confirm later)
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({
      type,
      client_id: user.id,
      provider_id: providerId,
      service_id: providerServiceId,
      status: "awaiting_provider",
      price_cents: priceCents,
      brief,
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  // 2) Optional booking for in_person
  if (type === "in_person" && booking?.start && booking?.end) {
    const { error: bErr } = await supabaseAdmin.from("bookings").insert({
      order_id: order.id,
      status: "requested",
      scheduled_start: booking.start,
      scheduled_end: booking.end,
      note: booking.note || null,
    });
    if (bErr) return res.status(400).json({ error: bErr.message });
  }

  // 3) Create Stripe PaymentIntent (server-side) and store id on order (optional now)
  // const pi = await stripe.paymentIntents.create({ ... });
  // await supabaseAdmin.from("orders").update({ stripe_payment_intent_id: pi.id }).eq("id", order.id);

  return res.status(200).json({ orderId: order.id });
}
