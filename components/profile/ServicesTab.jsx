// /components/profile/ServicesTab.jsx
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { money } from "@/lib/format";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ServicesTab({ providerId }) {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState({ type: "", category: "", max: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;
    (async () => {
      setLoading(true);
      const [{ data: categories }, { data: services }] = await Promise.all([
        supabase
          .from("app.taxonomy_categories")
          .select("id, name")
          .in(
            "id",
            supabase
              .from("app.provider_services")
              .select("category_id")
              .eq("provider_id", providerId)
          ), // (Supabase handles IN with subquery)
        supabase
          .from("app.provider_services")
          .select(
            `id, slug, title, type, price_from as priceFrom,
             duration_minutes as durationMinutes,
             lead_time_days as leadTimeDays,
             image_url as imageUrl,
             is_active as isActive,
             category_id as categoryId`
          )
          .eq("provider_id", providerId)
          .eq("is_active", true)
          .order("price_from", { ascending: true }),
      ]);
      setCats(categories || []);
      setRows(services || []);
      setLoading(false);
    })();
  }, [providerId]);

  const visible = useMemo(() => {
    return rows.filter((r) => {
      if (filters.type && r.type !== filters.type) return false;
      if (filters.category && r.categoryId !== filters.category) return false;
      if (
        filters.max &&
        r.priceFrom != null &&
        r.priceFrom > Number(filters.max) * 100
      )
        return false;
      return true;
    });
  }, [rows, filters]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-[var(--ink-700)]">Loading services…</div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-4">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-3">
        <select
          className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-900)]"
          value={filters.category}
          onChange={(e) =>
            setFilters((f) => ({ ...f, category: e.target.value }))
          }
        >
          <option value="">Category</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-900)]"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">Type</option>
          <option value="digital">Digital</option>
          <option value="in_person">In-person</option>
        </select>

        <label className="ml-auto flex items-center gap-2 text-sm">
          <span>Price ≤</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-24 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-900)]"
            placeholder="300"
            value={filters.max}
            onChange={(e) => setFilters((f) => ({ ...f, max: e.target.value }))}
          />
        </label>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--card-800)] text-center">
          <div className="text-lg font-semibold">No services listed</div>
          <div className="text-sm text-[var(--ink-700)]">
            See examples of my work in the Portfolio.
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((s) => (
            <article
              key={s.id}
              className="border border-[var(--border)] rounded-2xl p-4 bg-[var(--card-800)]"
            >
              <div className="flex gap-3">
                <div className="h-16 w-24 rounded-lg overflow-hidden bg-[var(--bg-900)] border border-[var(--border)]">
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{s.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs border border-[var(--border)]">
                      {s.type === "digital" ? "Virtual" : "In-person"}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-[var(--ink-700)]">
                    {s.type === "in_person" && s.durationMinutes
                      ? `${s.durationMinutes} min`
                      : s.leadTimeDays != null
                      ? `${s.leadTimeDays} day lead time`
                      : "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {s.priceFrom != null ? money(s.priceFrom) : "Ask"}
                  </div>
                  <button className="mt-2 px-3 py-1 rounded-lg bg-[var(--green-500)] text-[var(--bg-950)]">
                    Book
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
