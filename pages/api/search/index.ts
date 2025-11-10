// /pages/api/search/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSearchClient, getIndexName } from '@/lib/meili';

type SortKey = 'best' | 'price_low_to_high' | 'rating' | 'newest';

const BUSINESS_TYPES = ['provider', 'service', 'job', 'candidate', 'organization'] as const;
type BusinessType = typeof BUSINESS_TYPES[number];

function csv(q: unknown): string[] {
  return String(q || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function mapSort(sort: SortKey | undefined): string[] | undefined {
  switch (sort) {
    case 'price_low_to_high':
      return ['price_min:asc'];
    case 'rating':
      return ['rating:desc', 'rating_count:desc'];
    case 'newest':
      return ['created_at:desc'];
    case 'best':
    default:
      return undefined; // use native relevance
  }
}

/** Build a Meili filter string with our guardrails */
function buildFilter(req: NextApiRequest, selectedTypes: string[]) {
  const {
    category,
    subcategory,
    tags,
    is_digital,
    price_gte,
    price_lte,
    rating_gte,
  } = req.query;

  const f: string[] = [];

  // 1) Always restrict results to business objects (taxonomy excluded)
  const typeSet = selectedTypes.length ? selectedTypes : BUSINESS_TYPES as unknown as string[];
  f.push(
    `(${typeSet.map(t => `type = ${JSON.stringify(t)}`).join(' OR ')})`
  );

  // 2) Category / subcategory / tags
  if (category) f.push(`category = ${JSON.stringify(String(category))}`);
  if (subcategory) f.push(`subcategory = ${JSON.stringify(String(subcategory))}`);
  if (tags) {
    csv(tags).forEach(t => f.push(`tags = ${JSON.stringify(t)}`));
  }

  // 3) Digital facet
  if (is_digital === 'true') f.push('is_digital = true');

  // 4) Only apply price filters if "service" is among active types
  const hasService = selectedTypes.length
    ? selectedTypes.includes('service')
    : true; // when no chips, we allow price filters to work for service docs

  if (hasService) {
    if (price_gte) f.push(`price_min >= ${Number(price_gte)}`);
    if (price_lte) f.push(`price_min <= ${Number(price_lte)}`);
  }

  // 5) Rating floor
  if (rating_gte) f.push(`rating >= ${Number(rating_gte)}`);

  return f.length ? f.join(' AND ') : undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = getSearchClient();
    const index = client.index(getIndexName());

    const { q = '', page = '1', limit = '24', sort } = req.query;

    const selectedTypes = csv(req.query.type).filter(t =>
      (BUSINESS_TYPES as readonly string[]).includes(t)
    );

    const offset = (Number(page) - 1) * Number(limit);
    const options: Record<string, any> = {
      filter: buildFilter(req, selectedTypes),
      limit: Number(limit),
      offset,
      attributesToHighlight: ['title', 'description', 'full_name', 'handle'],
      attributesToCrop: ['description'],
      cropLength: 140,
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    };

    const sortArr = mapSort(sort as SortKey | undefined);
    if (sortArr) options.sort = sortArr;

    const result = await index.search(String(q), options);

    res.status(200).json({
      hits: result.hits,
      nbHits: result.estimatedTotalHits,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (e: any) {
    if (e?.code === 'index_not_found' || /Index .* not found/i.test(e?.message || '')) {
      return res.status(404).json({ error: 'index_not_found', hint: 'Index UID not found. Verify NEXT_PUBLIC_MEILI_INDEX.' });
    }
    if (/Invalid syntax for the sort parameter/i.test(e?.message || '')) {
      return res.status(400).json({ error: 'bad_sort', hint: 'Use "field:asc" or "field:desc".' });
    }
    if (/Attribute .* is not filterable/i.test(e?.message || '')) {
      return res.status(400).json({ error: 'not_filterable', hint: 'Run POST /api/search/settings to set filterableAttributes.' });
    }
    console.error(e);
    res.status(500).json({ error: e.message || 'search_failed' });
  }
}
