import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/components/ui/Card";

export default function CandidateProfile() {
  const [row, setRow] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("candidate_profile")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      setRow(
        data || {
          headline: "",
          resume_url: "",
          portfolio_url: "",
          availability: "",
          visibility: true,
          city: "",
          state: "",
          country: "",
        }
      );
    })();
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    const payload = { ...row, user_id: uid };
    const upsert = await supabase
      .from("candidate_profile")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();
    setSaving(false);
    if (upsert.error) return alert(upsert.error.message);
    alert("Saved!");
  }

  if (!row) return <Card title="Candidate profile">Loading…</Card>;

  return (
    <Card title="Candidate profile">
      <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          placeholder="Headline"
          value={row.headline || ""}
          onChange={(e) => setRow({ ...row, headline: e.target.value })}
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          placeholder="Portfolio URL"
          value={row.portfolio_url || ""}
          onChange={(e) => setRow({ ...row, portfolio_url: e.target.value })}
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border md:col-span-2"
          placeholder="Résumé URL"
          value={row.resume_url || ""}
          onChange={(e) => setRow({ ...row, resume_url: e.target.value })}
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          placeholder="Availability (e.g., full-time)"
          value={row.availability || ""}
          onChange={(e) => setRow({ ...row, availability: e.target.value })}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!row.visibility}
            onChange={(e) => setRow({ ...row, visibility: e.target.checked })}
          />
          Visible to recruiters
        </label>
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          placeholder="City"
          value={row.city || ""}
          onChange={(e) => setRow({ ...row, city: e.target.value })}
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          placeholder="State"
          value={row.state || ""}
          onChange={(e) => setRow({ ...row, state: e.target.value })}
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          placeholder="Country"
          value={row.country || ""}
          onChange={(e) => setRow({ ...row, country: e.target.value })}
        />
        <div className="md:col-span-2">
          <button
            disabled={saving}
            className="px-3 py-2 rounded-xl bg-[var(--blue-600)]"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Card>
  );
}
