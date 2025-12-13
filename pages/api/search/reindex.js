// /pages/api/search/reindex.js
import { supabaseAdmin, appAdmin } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const db = supabaseAdmin();
    const app = appAdmin(db);

    const results = [];

    // PROFILES
    {
      const { data, error } = await app.from("profiles").select("id");
      if (error) throw error;
      for (const r of data)
        await app.rpc("search_upsert_profile", { p_id: r.id });
      results.push({ profiles: data.length });
    }
    // CANDIDATES
    {
      const { data, error } = await app
        .from("candidate_profiles")
        .select("user_id");
      if (error) throw error;
      for (const r of data)
        await app.rpc("search_upsert_candidate", { u_id: r.user_id });
      results.push({ candidates: data.length });
    }
    // SERVICES
    {
      const { data, error } = await app.from("provider_services").select("id");
      if (error) throw error;
      for (const r of data)
        await app.rpc("search_upsert_service", { svc_id: r.id });
      results.push({ services: data.length });
    }
    // ORGS
    {
      const { data, error } = await app.from("orgs").select("id");
      if (error) throw error;
      for (const r of data) await app.rpc("search_upsert_org", { o_id: r.id });
      results.push({ orgs: data.length });
    }
    // JOBS
    {
      const { data, error } = await app.from("jobs").select("id");
      if (error) throw error;
      for (const r of data) await app.rpc("search_upsert_job", { j_id: r.id });
      results.push({ jobs: data.length });
    }
    // DOMAINS
    {
      const { data, error } = await app.from("taxonomy_domains").select("id");
      if (error) throw error;
      for (const r of data)
        await app.rpc("search_upsert_domain", { d_id: r.id });
      results.push({ domains: data.length });
    }
    // CATEGORIES
    {
      const { data, error } = await app
        .from("taxonomy_categories")
        .select("id");
      if (error) throw error;
      for (const r of data)
        await app.rpc("search_upsert_category", { c_id: r.id });
      results.push({ categories: data.length });
    }
    // TAGS
    {
      const { data, error } = await app.from("taxonomy_tags").select("id");
      if (error) throw error;
      for (const r of data) await app.rpc("search_upsert_tag", { t_id: r.id });
      results.push({ tags: data.length });
    }

    return res.status(200).json({ ok: true, results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
