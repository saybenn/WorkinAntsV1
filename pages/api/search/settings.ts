import type { NextApiRequest, NextApiResponse } from "next";
import { getMeiliClient, getIndexName } from "@/lib/meili";

/**
 * One-time configurator for your Meili index.
 * Call with: POST /api/search/settings
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const client = getMeiliClient(false); // admin key
    const index = client.index(getIndexName());

    // 1) Make your filters work
    await index.updateSettings({
      filterableAttributes: [
        "type",           // service | provider | job | candidate | organization
        "category",       // L1 slug
        "subcategory",    // L2 slug
        "tags",           // L3 slugs array
        "is_digital",
        "city",
        "state",
        // numeric ranges you use:
        "price_min",
        "rating"
      ],
      // 2) Allow sorts we actually use
      sortableAttributes: [
        "price_min",
        "rating",
        "rating_count",
        "created_at"
      ],
      // 3) What the search bar should look inside
      searchableAttributes: [
        "full_name",
        "title",
        "name",
        "handle",
        "description",
        "tags"
      ],
      // Optional — defaults are fine; keeping them simple:
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "exactness"
      ]
    });

    res.status(200).json({ ok: true, index: getIndexName() });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "settings_failed" });
  }
}
