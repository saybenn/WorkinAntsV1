import { MeiliSearch } from 'meilisearch';

export function getSearchClient() {
  const host = process.env.NEXT_PUBLIC_MEILI_HOST || process.env.MEILI_HOST;
  const key  = process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY;
  if (!host) throw new Error('Meili host missing');
  if (!key)  throw new Error('Search key missing');
  return new MeiliSearch({ host, apiKey: key });
}

export function getAdminClient() {
  const host = process.env.NEXT_PUBLIC_MEILI_HOST || process.env.MEILI_HOST;
  const key  = process.env.MEILI_MASTER_KEY;
  if (!host) throw new Error('Meili host missing');
  if (!key)  throw new Error('Admin key missing');
  return new MeiliSearch({ host, apiKey: key });
}


/** Read the index name at runtime to pick up env changes reliably */
export function getIndexName() {
  return (
    process.env.NEXT_PUBLIC_MEILI_INDEX ||
    process.env.MEILI_INDEX ||
    'search_docs' // your desired default
  );
}
