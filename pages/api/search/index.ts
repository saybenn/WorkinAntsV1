import type { NextApiRequest, NextApiResponse } from 'next';
import { getMeiliClient, getIndexName } from '@/lib/meili';

type SortKey = 'best' | 'price_low_to_high' | 'rating' | 'newest';

function buildFilter(req: NextApiRequest) {
  const {
    type, // string or csv
    category,
    subcategory,
    tags, // csv
    is_digital,
    price_gte,
    price_lte,
    rating_gte
  } = req.query;

  const f: string[] = [];

  if (type) {
    const arr = String(type).split(',').map(s => s.trim());
    if (arr.length) f.push(`(${arr.map(t => `type = ${JSON.stringify(t)}`).join(' OR ')})`);
  }
  if (category) f.push(`category = ${JSON.stringify(String(category))}`);
  if (subcategory) f.push(`subcategory = ${JSON.stringify(String(subcategory))}`);
  if (tags) {
    String(tags).split(',').forEach(t => f.push(`tags = ${JSON.stringify(t.trim())}`));
  }
  if (is_digital === 'true') f.push(`is_digital = true`);
  if (price_gte) f.push(`price_min >= ${Number(price_gte)}`);
  if (price_lte) f.push(`price_min <= ${Number(price_lte)}`);
  if (rating_gte) f.push(`rating >= ${Number(rating_gte)}`);

  return f.length ? f.join(' AND ') : undefined;
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
      // Let Meili relevance take over (no explicit sort param)
      return undefined;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = getMeiliClient(true);
    const index = client.index(getIndexName());

    const { q = '', page = '1', limit = '24', sort, lat, lng, radius } = req.query;

    const filter = buildFilter(req);
    const aroundRadius = radius ? Number(radius) * 1609.34 : undefined;
    const aroundLatLng = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
    const offset = (Number(page) - 1) * Number(limit);

    const options: Record<string, any> = {
      filter,
      limit: Number(limit),
      offset
    };
    const sortArr = mapSort(sort as SortKey | undefined);
    if (sortArr) options.sort = sortArr;
    if (aroundLatLng && aroundRadius) {
      // @ts-ignore (depending on meili client version)
      options.aroundLatLng = aroundLatLng;
      // @ts-ignore
      options.aroundRadius = aroundRadius;
    }

    const result = await index.search(String(q), options);
    res.status(200).json({
      hits: result.hits,
      nbHits: result.estimatedTotalHits,
      limit: result.limit,
      offset: result.offset
    });
  } catch (e: any) {
    if (e?.code === 'index_not_found' || /Index .* not found/i.test(e?.message || '')) {
      return res.status(404).json({ error: 'index_not_found', hint: 'Index UID not found. Verify NEXT_PUBLIC_MEILI_INDEX.' });
    }
    if (/Invalid syntax for the sort parameter/i.test(e?.message || '')) {
      return res.status(400).json({ error: 'bad_sort', hint: 'Use "field:asc" or "field:desc".' });
    }
    console.error(e);
    res.status(500).json({ error: e.message || 'search_failed' });
  }
}