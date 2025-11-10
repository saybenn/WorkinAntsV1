import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminClient, getIndexName } from '@/lib/meili';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const host = process.env.NEXT_PUBLIC_MEILI_HOST || process.env.MEILI_HOST || '(missing)';
    const indexName = getIndexName();

    // Use ADMIN here so we can safely list indexes.
    const adminClient = getAdminClient();
    const indexes = await adminClient.getIndexes();
    const exists = indexes.results.some(i => i.uid === indexName);

    res.status(200).json({
      host,
      indexName,
      exists,
      availableIndexes: indexes.results.map(i => i.uid),
      usingSearchKey: Boolean(process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY),
      usingAdminKey: Boolean(process.env.MEILI_MASTER_KEY)
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'diag_failed' });
  }
}
