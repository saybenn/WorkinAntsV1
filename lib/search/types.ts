// /lib/search/types.ts
export type BusinessType = 'provider' | 'service' | 'job' | 'candidate' | 'organization';
export type TaxonomyType = 'domain' | 'category' | 'tag';

export type SearchDoc = {
  id: string;
  source: 'profile' | 'service' | 'job' | 'candidate' | 'organization' | 'taxonomy';
  // prefer array semantics going forward
  types?: (BusinessType | TaxonomyType)[];
  // legacy single-valued type (still supported in filters)
  type?: BusinessType | TaxonomyType;
  primary_type?: BusinessType | TaxonomyType;

  // display
  title?: string;
  name?: string;
  full_name?: string;
  handle?: string;
  description?: string;

  // taxonomy fields (for services and hints)
  category?: string;     // L1 slug
  subcategory?: string;  // L2 slug
  tags?: string[];       // L3 slugs

  // meta
  is_digital?: boolean;
  city?: string;
  state?: string;

  price_min?: number;
  rating?: number;
  rating_count?: number;
  created_at?: string;

  // taxonomy-only extras
  slug?: string;
  level?: 1 | 2 | 3;
  parent_slug?: string;

  // meili formatting
  _formatted?: Record<string, any>;
};
