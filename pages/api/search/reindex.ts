import type { NextApiRequest, NextApiResponse } from 'next';
import { getMeiliClient, getIndexName } from '@/lib/meili';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only key (NOT anon)
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: protect (e.g., check your admin session / header secret)
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { data: services, error } = await supabase.rpc('public_search_projection'); 
    // ↑ tip: make a SQL view/rpc that returns unified docs across services/providers/jobs/candidates

    if (error) throw error;

    const client = getMeiliClient(false);
    const idx = client.index(getIndexName());
    const { taskUid } = await idx.updateDocuments(services, { primaryKey: 'id' });
    res.status(200).json({ ok: true, taskUid, count: services?.length || 0 });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'reindex_failed' });
  }
}
