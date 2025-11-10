import { MeiliSearch } from 'meilisearch';

export function getMeiliClient(searchOnly = false) {
  const host =
    process.env.NEXT_PUBLIC_MEILI_HOST ||
    process.env.MEILI_HOST;
  const apiKey = searchOnly
    ? process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY
    : process.env.MEILI_MASTER_KEY;

  if (!host) throw new Error('Meili host missing');
  return new MeiliSearch({ host, apiKey });
}

/** Read the index name at runtime to pick up env changes reliably */
export function getIndexName() {
  return (
    process.env.NEXT_PUBLIC_MEILI_INDEX ||
    process.env.MEILI_INDEX ||
    'search_docs' // your desired default
  );
}
