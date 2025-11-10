// /pages/api/services/create.js
import { supabaseServerClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/session";

function slugify(s = "") {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // 1) Auth
  const { user, token } = await getSessionUser(req);
  if (!user || !token) return res.status(401).json({ error: "Unauthorized" });
  const db = supabaseServerClient(token);

  // 2) Derive provider_id from the signed-in user (ignore any client-sent provider_id)
  const { data: prov, error: provErr } = await db
    .from("providers")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (provErr) return res.status(400).json({ error: provErr.message });
  if (!prov?.id)
    return res.status(400).json({
      error:
        "No provider entity for this user. Visit /api/provider/ensure first.",
    });

  // 3) Validate & normalize input
  const body = req.body || {};
  const title = (body.title || "").trim();
  const type = body.type === "in_person" ? "in_person" : "digital";
  if (!title) return res.status(400).json({ error: "Title is required." });

  const description = (body.description || "").trim() || null;
  const category_id = body.category_id || null;
  const image_url = (body.image_url || body.imageurl || "").trim() || null;

  // ints
  const price_from = body.price_from ?? body.pricefrom ?? null;
  const lead_time_days = body.lead_time_days ?? body.leadtimedays ?? null;
  const duration_minutes =
    body.duration_minutes ?? body.durationminutes ?? null;
  const booking_buffer_min =
    body.booking_buffer_min ?? body.bookingbuffermin ?? 15;
  const is_active = body.is_active ?? body.active ?? true;

  // Type-specific guards
  if (type === "digital") {
    // allow price_from, lead_time_days, image_url; null out duration/booking buffer
    // (we still store booking_buffer_min default for schema simplicity if you prefer — your call)
  }
  if (type === "in_person") {
    if (duration_minutes != null && Number(duration_minutes) <= 0)
      return res
        .status(400)
        .json({ error: "Duration (minutes) must be > 0 for in-person." });
  }

  // 4) Slug (unique per provider)
  let base = slugify(title);
  if (!base) base = `svc-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  // probe for collisions
  for (;;) {
    const { data: existing, error: existErr } = await db
      .from("provider_services")
      .select("id")
      .eq("provider_id", prov.id)
      .eq("slug", candidate)
      .maybeSingle();
    if (existErr) return res.status(400).json({ error: existErr.message });
    if (!existing) break;
    candidate = `${base}-${suffix++}`;
  }

  // 5) Insert (RLS ensures we only insert for our provider)
  const payload = {
    provider_id: prov.id,
    slug: candidate,
    title,
    type,
    description,
    price_from: price_from != null ? Number(price_from) : null,
    duration_minutes:
      duration_minutes != null ? Number(duration_minutes) : null,
    lead_time_days: lead_time_days != null ? Number(lead_time_days) : null,
    image_url,
    category_id,
    booking_buffer_min:
      booking_buffer_min != null ? Number(booking_buffer_min) : 15,
    is_active: !!is_active,
  };

  const { data, error } = await db
    .from("provider_services")
    .insert(payload)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json(data);
}
