import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

async function getProvider() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const resp = await fetch("/api/provider/ensure", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProviderAvailability() {
  const [provider, setProvider] = useState(null);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    weekday: 1,
    start: "09:00",
    end: "17:00",
  });

  useEffect(() => {
    (async () => {
      const p = await getProvider();
      setProvider(p);
      const { data } = await supabase
        .from("provider_availability")
        .select("*")
        .eq("provider_id", p.id)
        .order("weekday", { ascending: true });
      setRows(data || []);
    })();
  }, []);

  async function addWindow(e) {
    e.preventDefault();
    const payload = {
      provider_id: provider.id,
      weekday: Number(form.weekday),
      start_time: form.start,
      end_time: form.end,
    };
    const { data, error } = await supabase
      .from("provider_availability")
      .insert(payload)
      .select()
      .single();
    if (error) return alert(error.message);
    setRows([...rows, data]);
  }

  async function removeWindow(id) {
    await supabase.from("provider_availability").delete().eq("id", id);
    setRows(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addWindow} className="flex flex-wrap items-center gap-3">
        <select
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          value={form.weekday}
          onChange={(e) => setForm((f) => ({ ...f, weekday: e.target.value }))}
        >
          {DAYS.map((d, i) => (
            <option key={i} value={i}>
              {d}
            </option>
          ))}
        </select>
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          value={form.start}
          onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
        />
        <input
          className="px-3 py-2 rounded-xl bg-[var(--bg-900)] border"
          value={form.end}
          onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
        />
        <button className="px-3 py-2 rounded-xl bg-[var(--blue-600)]">
          Add
        </button>
      </form>

      <div className="overflow-x-auto border border-[var(--border)] rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card-800)]">
            <tr>
              <th className="p-3">Day</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[var(--border)]">
                <td className="p-3">{DAYS[r.weekday]}</td>
                <td className="p-3">{r.start_time}</td>
                <td className="p-3">{r.end_time}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => removeWindow(r.id)}
                    className="px-2 py-1 rounded border"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-6" colSpan={4}>
                  No availability set.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
