// /pages/api/admin/seed-taxonomy.js
import { createClient } from "@supabase/supabase-js";
import taxonomy from "@/data/taxonomy.json";

export default async function handler(req, res) {
  // 🔐 guard this: only allow your admin user/service role
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // server-only secret
  );

  // upsert categories + subcategories
  for (const cat of taxonomy.categories) {
    const { data: catRow, error: catErr } = await supabase
      .from("taxonomy_categories")
      .upsert({ slug: cat.slug, name: cat.name }, { onConflict: "slug" })
      .select()
      .single();
    if (catErr) return res.status(500).json({ error: catErr.message });

    for (const sub of cat.subcategories) {
      const { error: subErr } = await supabase
        .from("taxonomy_subcategories")
        .upsert(
          { slug: sub.slug, name: sub.name, category_id: catRow.id },
          { onConflict: "slug" }
        );
      if (subErr) return res.status(500).json({ error: subErr.message });
    }
  }

  return res.json({ ok: true });
}
