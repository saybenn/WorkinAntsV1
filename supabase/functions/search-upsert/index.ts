// deno-lint-ignore-file no-explicit-any
import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { MeiliSearch } from "meili";

/** Tiny, inline normalizers so this file is self-contained. Adjust as needed. */
function toSearchDocFromProfile(row: any) {
  let roleSet: string[] = [];
  if (Array.isArray(row.role_set)) roleSet = row.role_set;
  else if (typeof row.role_set === "string") { try { roleSet = JSON.parse(row.role_set); } catch {} }

  const business = ["provider", "candidate", "organization"];
  const types = roleSet.filter((r) => business.includes(String(r)));
  const primary = (types[0] as any) ?? "provider";

  return {
    id: row.id,
    source: "profile",
    type: primary,
    types,
    primary_type: primary,
    title: row.full_name ?? row.handle,
    full_name: row.full_name ?? undefined,
    handle: row.handle ?? undefined,
    description: row.bio ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    rating: typeof row.rating === "number" ? row.rating : undefined,
    rating_count: typeof row.rating_count === "number" ? row.rating_count : undefined,
    created_at: row.created_at ?? undefined,
    avatar_url: row.avatar_url ?? undefined
  };
}

function toSearchDocFromService(row: any) {
  return {
    id: row.id,
    source: "service",
    type: "service",
    types: ["service"],
    primary_type: "service",
    title: row.title,
    description: row.description ?? undefined,
    category: row.category_slug ?? undefined,
    subcategory: row.subcategory_slug ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    is_digital: !!row.is_digital,
    price_min: typeof row.price_min === "number" ? row.price_min : undefined,
    rating: typeof row.rating === "number" ? row.rating : undefined,
    rating_count: typeof row.rating_count === "number" ? row.rating_count : undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    created_at: row.created_at ?? undefined,
    image_url: row.image_url ?? undefined
  };
}

/** Env from Supabase (Function Settings → Environment Variables) */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MEILI_HOST = Deno.env.get("MEILI_HOST")!;
const MEILI_KEY = Deno.env.get("MEILI_MASTER_KEY")!;
const INDEX = Deno.env.get("MEILI_INDEX") || "search_docs";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const { source, id } = (await req.json()) as { source?: string; id?: string };
    if (!source || !id) return new Response("Missing source or id", { status: 400 });

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const meili = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY });
    const index = meili.index(INDEX);

    let doc: any;

    if (source === "profile") {
      const { data, error } = await sb
        .from("profiles")
        .select("id, full_name, handle, bio, role_set, city, state, rating, rating_count, avatar_url, created_at")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message || "profile_fetch_failed");
      doc = toSearchDocFromProfile(data);
    } else if (source === "service") {
      const { data, error } = await sb
        .from("services")
        .select("id, title, description, category_slug, subcategory_slug, tags, is_digital, price_min, rating, rating_count, city, state, image_url, created_at")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message || "service_fetch_failed");
      doc = toSearchDocFromService(data);
    } else {
      return new Response("Unsupported source", { status: 400 });
    }

    await index.addDocuments([doc], { primaryKey: "id" } as any);
    return new Response(JSON.stringify({ ok: true, id }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    const msg = (e && typeof e === "object" && "message" in e) ? (e as any).message : String(e);
    console.error("search-upsert error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
