// /pages/api/search/sync.js
import { supabaseAdmin, appAdmin } from "@/lib/supabaseAdmin";
import { meili } from "@/lib/meili";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const db = supabaseAdmin();
    const app = appAdmin(db);

    const { data, error } = await app.from("search_docs").select("*");
    if (error) throw error;

    const index =
      (await meili.getIndex("search_docs").catch(() => null)) ||
      (await meili.createIndex("search_docs", { primaryKey: "id" }));

    await index.updateSettings({
      searchableAttributes: [
        "title",
        "description",
        "full_name",
        "handle",
        "tags",
      ],
      filterableAttributes: [
        "type",
        "types",
        "category",
        "subcategory",
        "tags",
        "city",
        "state",
        "is_digital",
        "price_min",
        "rating",
      ],
      sortableAttributes: ["price_min", "rating", "rating_count", "created_at"],
    });

    const task = await index.addDocuments(data);
    return res.status(200).json({ ok: true, count: data.length, task });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
