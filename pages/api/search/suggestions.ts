// /pages/api/search/suggestions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSearchClient, getIndexName } from '@/lib/meili';

const TAXONOMY_TYPES = ['domain', 'category', 'tag'] as const;

function csv(q: unknown): string[] {
  return String(q || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = getSearchClient();
    const index = client.index(getIndexName());

    const { q = '', limit = '6', types } = req.query;

    // Allow caller to constrain to a subset (e.g., only tags)
    const typeFilter = (csv(types).length ? csv(types) : TAXONOMY_TYPES as unknown as string[])
      .map(t => `type = ${JSON.stringify(t)}`)
      .join(' OR ');

    const filters = `(${typeFilter})`;

    const result = await index.search(String(q), {
      filter: filters,
      limit: Number(limit),
      attributesToHighlight: ['title', 'name'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    // Return just what bubbles need
    const suggestions = (result.hits || []).map((h: any) => ({
      id: h.id,
      type: Array.isArray(h.types) && h.types[0] ? h.types[0] : h.type ?? h.primary_type ?? 'tag',
      title: h.title ?? h.name,
      slug: h.slug,
      level: h.level,
      parent_slug: h.parent_slug,
      _formatted: h._formatted,
    }));

    res.status(200).json({ suggestions, nbHits: result.estimatedTotalHits });
  } catch (e: any) {
    if (e?.code === 'index_not_found' || /Index .* not found/i.test(e?.message || '')) {
      return res.status(404).json({ error: 'index_not_found', hint: 'Index UID not found. Verify NEXT_PUBLIC_MEILI_INDEX.' });
    }
    console.error(e);
    res.status(500).json({ error: e.message || 'suggestions_failed' });
  }
}
