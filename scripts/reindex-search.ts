// /scripts/reindex-search.ts
// Run with: ts-node scripts/reindex-search.ts (or node after ts build)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';
import { toSearchDocFromProfile, toSearchDocFromService } from '@/lib/search/normalize';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MEILI_HOST = process.env.MEILI_HOST || process.env.NEXT_PUBLIC_MEILI_HOST!;
const MEILI_KEY = process.env.MEILI_MASTER_KEY!;
const INDEX = process.env.MEILI_INDEX || process.env.NEXT_PUBLIC_MEILI_INDEX || 'search_docs';

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON) throw new Error('Supabase env missing');
  if (!MEILI_HOST || !MEILI_KEY) throw new Error('Meili env missing');

  const sb = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });
  const meili = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY });
  const index = meili.index(INDEX);

  // Fetch data (adjust table/columns to your schema)
  const { data: profiles, error: pErr } = await sb
    .from('profiles')
    .select('id, full_name, handle, bio, role_set, city, state, rating, rating_count, created_at')
    .eq('is_public', true);

  if (pErr) throw pErr;

  const { data: services, error: sErr } = await sb
    .from('services')
    .select('id, title, description, category_slug, subcategory_slug, tags, is_digital, price_min, rating, rating_count, city, state, created_at')
    .eq('is_active', true);

  if (sErr) throw sErr;

  const docs: any[] = [];
  (profiles || []).forEach(row => docs.push(toSearchDocFromProfile(row)));
  (services || []).forEach(row => docs.push(toSearchDocFromService(row)));

  // Chunk upserts
  const chunk = 1000;
  for (let i = 0; i < docs.length; i += chunk) {
    const slice = docs.slice(i, i + chunk);
    // upsert into Meili
    // @ts-ignore
    await index.addDocuments(slice, { primaryKey: 'id' });
    console.log(`Upserted ${i + slice.length}/${docs.length}`);
  }

  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
