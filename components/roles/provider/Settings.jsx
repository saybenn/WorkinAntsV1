import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";

async function fetchProvider() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const r = await fetch("/api/provider/ensure", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function ProviderSettings() {
  const [prov, setProv] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => setProv(await fetchProvider()))();
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("provider")
      .update({
        display_name: prov.displayName,
        tagline: prov.tagline || null,
        bio: prov.bio || null,
        city: prov.city || null,
        state: prov.state || null,
        country: prov.country || null,
      })
      .eq("id", prov.id);
    setSaving(false);
    if (error) return alert(error.message);
    alert("Saved!");
  }

  if (!prov) return <Card title="Settings">Loading…</Card>;

  return (
    <Card title="Provider settings">
      <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          value={prov.displayName}
          onChange={(e) => setProv({ ...prov, displayName: e.target.value })}
          placeholder="Display name"
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          value={prov.tagline || ""}
          onChange={(e) => setProv({ ...prov, tagline: e.target.value })}
          placeholder="Tagline"
        />
        <textarea
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border md:col-span-2"
          rows={4}
          value={prov.bio || ""}
          onChange={(e) => setProv({ ...prov, bio: e.target.value })}
          placeholder="Bio"
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          value={prov.city || ""}
          onChange={(e) => setProv({ ...prov, city: e.target.value })}
          placeholder="City"
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          value={prov.state || ""}
          onChange={(e) => setProv({ ...prov, state: e.target.value })}
          placeholder="State"
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          value={prov.country || ""}
          onChange={(e) => setProv({ ...prov, country: e.target.value })}
          placeholder="Country"
        />
        <div className="md:col-span-2">
          <button
            disabled={saving}
            className="px-3 py-2 rounded-xl bg-[var(--blue-600)]"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </Card>
  );
}
