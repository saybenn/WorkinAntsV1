// /pages/api/search/settings.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminClient, getIndexName } from "@/lib/meili";

/** POST /api/search/settings — idempotent index settings */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const client = getAdminClient();
    const index = client.index(getIndexName());

    await index.updateSettings({
      filterableAttributes: [
        "type",          // keep if your docs also carry a single 'type'
        "types",         // <-- prefer this (array) in new docs
        "category",
        "subcategory",
        "tags",
        "is_digital",
        "city",
        "state",
        "price_min",
        "rating",
      ],
      sortableAttributes: [
        "price_min",
        "rating",
        "rating_count",
        "created_at",
      ],
      searchableAttributes: [
        "full_name",
        "title",
        "name",
        "handle",
        "description",
        "tags",
      ],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "exactness",
      ],
    });

    res.status(200).json({ ok: true, index: getIndexName() });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "settings_failed" });
  }
}
