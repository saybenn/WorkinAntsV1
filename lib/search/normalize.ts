// /lib/search/normalize.ts
import type { SearchDoc, BusinessType, TaxonomyType } from './types';

export function toSearchDocFromProfile(row: any): SearchDoc {
  // row.role_set might be a JSON string from SQL; normalize to array
  const roleSet: string[] = Array.isArray(row.role_set)
    ? row.role_set
    : typeof row.role_set === 'string'
      ? JSON.parse(row.role_set)
      : [];

  const types = roleSet.filter((r): r is BusinessType => (
    ['provider','candidate','organization'].includes(String(r))
  ));

  const primary = (types[0] as BusinessType|undefined) ?? 'provider';

  return {
    id: row.id,
    source: 'profile',
    types,
    type: primary,            // legacy compatibility
    primary_type: primary,
    title: row.full_name ?? row.handle,
    full_name: row.full_name,
    handle: row.handle,
    description: row.bio ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    rating: row.rating ?? undefined,
    rating_count: row.rating_count ?? undefined,
    created_at: row.created_at ?? undefined,
    // avatar_url kept in doc if you plan to render it in cards
    // (Meili docs can store it; ensure privacy is okay)
    // @note: keep URLs public or signed
  };
}

export function toSearchDocFromService(row: any): SearchDoc {
  return {
    id: row.id,
    source: 'service',
    types: ['service'],
    type: 'service',
    primary_type: 'service',
    title: row.title,
    description: row.description ?? undefined,
    category: row.category_slug ?? undefined,
    subcategory: row.subcategory_slug ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    is_digital: !!row.is_digital,
    price_min: typeof row.price_min === 'number' ? row.price_min : undefined,
    rating: row.rating ?? undefined,
    rating_count: row.rating_count ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    created_at: row.created_at ?? undefined,
  };
}

export function toSearchDocFromTaxonomy(row: any, level: 1|2|3, kind: TaxonomyType): SearchDoc {
  return {
    id: row.slug,
    source: 'taxonomy',
    types: [kind],
    type: kind,
    primary_type: kind,
    title: row.name,
    slug: row.slug,
    level,
    parent_slug: row.parent_slug ?? undefined,
  };
}
