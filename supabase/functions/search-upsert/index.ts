// /supabase/functions/search-upsert/index.ts
// deno-lint-ignore-file no-explicit-any
import 'https://deno.land/x/xhr@0.3.0/mod.ts';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { MeiliSearch } from 'https://esm.sh/meilisearch@0.40.0';
import { toSearchDocFromProfile, toSearchDocFromService } from '../../lib/search/normalize.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MEILI_HOST = Deno.env.get('MEILI_HOST')!;
const MEILI_KEY = Deno.env.get('MEILI_MASTER_KEY')!;
const INDEX = Deno.env.get('MEILI_INDEX') || 'search_docs';

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const { source, id } = await req.json();
    if (!source || !id) return new Response('Missing source or id', { status: 400 });

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const meili = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY });
    const index = meili.index(INDEX);

    let doc: any;

    if (source === 'profile') {
      const { data, error } = await sb.from('profiles')
        .select('id, full_name, handle, bio, role_set, city, state, rating, rating_count, created_at')
        .eq('id', id).single();
      if (error) throw error;
      doc = toSearchDocFromProfile(data);
    } else if (source === 'service') {
      const { data, error } = await sb.from('services')
        .select('id, title, description, category_slug, subcategory_slug, tags, is_digital, price_min, rating, rating_count, city, state, created_at')
        .eq('id', id).single();
      if (error) throw error;
      doc = toSearchDocFromService(data);
    } else {
      return new Response('Unsupported source', { status: 400 });
    }

    // @ts-ignore
    await index.addDocuments([doc], { primaryKey: 'id' });

    return new Response(JSON.stringify({ ok: true, id }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
