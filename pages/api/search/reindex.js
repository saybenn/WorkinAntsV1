// /pages/api/search/reindex.js
import { supabaseAdmin, appAdminDb } from "@/lib/supabase/admin";

const DEFAULT_CONCURRENCY = 8;

/**
 * Minimal concurrency limiter to avoid hammering Postgres + blowing serverless timeouts.
 */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;

  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

function asMessage(e) {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  return e.message || JSON.stringify(e);
}

/**
 * Optional: protect this endpoint (recommended).
 * Set SEARCH_REINDEX_TOKEN in env, then call with:
 *   Authorization: Bearer <token>
 */
function assertAuth(req) {
  const token = process.env.SEARCH_REINDEX_TOKEN;
  if (!token) return; // no auth configured
  const header = req.headers.authorization || "";
  const ok = header === `Bearer ${token}`;
  if (!ok) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    assertAuth(req);

    const db = supabaseAdmin();

    // Support either signature:
    // - appAdminDb(db) -> returns scoped client
    // - appAdminDb()   -> returns scoped client (ignores arg)
    const app =
      typeof appAdminDb === "function"
        ? appAdminDb.length >= 1
          ? await appAdminDb(db)
          : await appAdminDb()
        : db;

    const concurrency =
      Number(req.query.concurrency || DEFAULT_CONCURRENCY) ||
      DEFAULT_CONCURRENCY;

    const results = [];

    async function reindexBlock({ name, table, select, rpc, argName, getId }) {
      const { data, error } = await app.from(table).select(select);
      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      await mapLimit(rows, concurrency, async (r) => {
        const id = getId(r);
        if (!id) return;
        const { error: rpcErr } = await app.rpc(rpc, { [argName]: id });
        if (rpcErr) throw rpcErr;
      });

      results.push({ [name]: rows.length });
    }

    // NOTE: keep these in the order your search pipeline expects.
    await reindexBlock({
      name: "profiles",
      table: "profiles",
      select: "id",
      rpc: "search_upsert_profile",
      argName: "p_id",
      getId: (r) => r.id,
    });

    await reindexBlock({
      name: "candidates",
      table: "candidate_profiles",
      select: "user_id",
      rpc: "search_upsert_candidate",
      argName: "u_id",
      getId: (r) => r.user_id,
    });

    await reindexBlock({
      name: "services",
      table: "provider_services",
      select: "id",
      rpc: "search_upsert_service",
      argName: "svc_id",
      getId: (r) => r.id,
    });

    await reindexBlock({
      name: "orgs",
      table: "orgs",
      select: "id",
      rpc: "search_upsert_org",
      argName: "o_id",
      getId: (r) => r.id,
    });

    await reindexBlock({
      name: "jobs",
      table: "jobs",
      select: "id",
      rpc: "search_upsert_job",
      argName: "j_id",
      getId: (r) => r.id,
    });

    await reindexBlock({
      name: "domains",
      table: "taxonomy_domains",
      select: "id",
      rpc: "search_upsert_domain",
      argName: "d_id",
      getId: (r) => r.id,
    });

    await reindexBlock({
      name: "categories",
      table: "taxonomy_categories",
      select: "id",
      rpc: "search_upsert_category",
      argName: "c_id",
      getId: (r) => r.id,
    });

    await reindexBlock({
      name: "tags",
      table: "taxonomy_tags",
      select: "id",
      rpc: "search_upsert_tag",
      argName: "t_id",
      getId: (r) => r.id,
    });

    return res.status(200).json({ ok: true, concurrency, results });
  } catch (e) {
    const status = e.statusCode || 500;
    console.error(e);
    return res.status(status).json({ ok: false, error: asMessage(e) });
  }
}
