// /components/roles/provider/Services.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

function slugify(s = "") {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProviderServices() {
  const [provider, setProvider] = useState(null);
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "digital", // 'digital' | 'in_person'
    description: "",
    price_from: "",
    duration_minutes: "60", // in_person
    lead_time_days: "0", // digital (or general prep)
    image_url: "",
    category_id: "",
    booking_buffer_min: "15", // in_person
    is_active: true,
  });

  async function fetchProviderViaAPI() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    const resp = await fetch("/api/provider/ensure", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.json();
  }

  useEffect(() => {
    (async () => {
      try {
        const prov = await fetchProviderViaAPI();
        setProvider(prov);

        const [{ data: c }, { data: s }] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase
            .from("provider_services")
            .select("*")
            .eq("provider_id", prov.id) // important: scope to me
            .order("created_at", { ascending: false }),
        ]);
        setCats(c || []);
        setRows(s || []);
      } catch (e) {
        setError(e.message || String(e));
      }
    })();
  }, []);

  const isDigital = useMemo(() => form.type === "digital", [form.type]);
  const isInPerson = !isDigital;

  async function createService(e) {
    e.preventDefault();
    setError("");
    if (!provider?.id) {
      setError("Provider missing. Reload.");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      // POST to secure API; do NOT send provider_id
      const payload = {
        title: form.title.trim(),
        type: form.type,
        description: form.description?.trim() || null,
        price_from: form.price_from ? Number(form.price_from) : null,
        duration_minutes:
          isInPerson && form.duration_minutes
            ? Number(form.duration_minutes)
            : null,
        lead_time_days:
          isDigital && form.lead_time_days
            ? Number(form.lead_time_days)
            : form.lead_time_days
            ? Number(form.lead_time_days)
            : null,
        image_url: form.image_url?.trim() || null,
        category_id: form.category_id || null,
        booking_buffer_min:
          isInPerson && form.booking_buffer_min
            ? Number(form.booking_buffer_min)
            : 15,
        is_active: !!form.is_active,
      };

      const resp = await fetch("/api/services/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(j.error || "Failed to create service.");
      }
      const created = await resp.json();
      setRows((rs) => [created, ...rs]);
      setCreating(false);
      setForm({
        title: "",
        type: "digital",
        description: "",
        price_from: "",
        duration_minutes: "60",
        lead_time_days: "0",
        image_url: "",
        category_id: "",
        booking_buffer_min: "15",
        is_active: true,
      });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="h2">Services</h2>
        <button
          className="px-3 py-2 rounded-xl bg-[var(--blue-600)]"
          onClick={() => {
            setError("");
            setCreating(true);
          }}
        >
          New service
        </button>
      </div>

      {creating && (
        <form
          onSubmit={createService}
          className="border border-[var(--border)] rounded-2xl p-4 bg-[var(--card-900)] grid gap-3 md:grid-cols-4"
        >
          {error && (
            <div className="md:col-span-4 text-sm text-red-400 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <input
            className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border md:col-span-2"
            placeholder="Service title (e.g., Starter Website Page)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />

          <select
            className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="digital">Digital</option>
            <option value="in_person">In-person</option>
          </select>

          <select
            className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
            value={form.category_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, category_id: e.target.value }))
            }
          >
            <option value="">No category</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <textarea
            className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border md:col-span-4"
            rows={3}
            placeholder="Describe your service: what's included, deliverables, ideal buyer, and exclusions."
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />

          {/* Price (both types) */}
          <input
            className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
            placeholder="Starting price (in cents, e.g., 25000 = $250.00)"
            inputMode="numeric"
            value={form.price_from}
            onChange={(e) =>
              setForm((f) => ({ ...f, price_from: e.target.value }))
            }
          />

          {/* Digital-only: lead time */}
          {isDigital && (
            <input
              className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
              placeholder="Typical lead time (days until delivery)"
              inputMode="numeric"
              value={form.lead_time_days}
              onChange={(e) =>
                setForm((f) => ({ ...f, lead_time_days: e.target.value }))
              }
            />
          )}

          {/* In-person-only: duration + booking buffer */}
          {isInPerson && (
            <>
              <input
                className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
                placeholder="Appointment duration (minutes, e.g., 60)"
                inputMode="numeric"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration_minutes: e.target.value }))
                }
              />
              <input
                className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
                placeholder="Buffer between appointments (minutes)"
                inputMode="numeric"
                value={form.booking_buffer_min}
                onChange={(e) =>
                  setForm((f) => ({ ...f, booking_buffer_min: e.target.value }))
                }
              />
            </>
          )}

          <input
            className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border md:col-span-2"
            placeholder="Cover image URL (optional)"
            value={form.image_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, image_url: e.target.value }))
            }
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
            />
            <span>Active</span>
          </label>

          <div className="md:col-span-4 flex gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-xl border"
              onClick={() => {
                setCreating(false);
                setError("");
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="ml-auto px-3 py-2 rounded-xl bg-[var(--blue-600)] disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border border-[var(--border)] rounded-2xl">
        <table className="w-full text-sm">
          <thead className="text-left bg-[var(--card-800)]">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price From</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[var(--border)]">
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">
                  {r.category_id
                    ? cats.find((c) => c.id === r.category_id)?.name || "—"
                    : "—"}
                </td>
                <td className="p-3">
                  {r.price_from != null
                    ? `$${(r.price_from / 100).toFixed(2)}`
                    : "—"}
                </td>
                <td className="p-3">
                  {r.duration_minutes
                    ? `${r.duration_minutes}m`
                    : r.type === "in_person"
                    ? "—"
                    : ""}
                </td>
                <td className="p-3">{r.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-[var(--ink-700)]">
                  No services yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
