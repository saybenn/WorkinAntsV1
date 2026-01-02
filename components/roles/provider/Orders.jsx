// components/roles/provider/Orders.jsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import { money } from "@/lib/format";

const STATUS = [
  "awaiting_provider",
  "accepted",
  "delivered",
  "completed",
  "refunded",
  "cancelled",
];
const TYPES = ["digital", "in_person"];

export default function ProviderOrders() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState([]);
  const [type, setType] = useState([]);

  async function getMyProviderId() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return null;
    const { data, error } = await supabase
      .from("providers")
      .select("id")
      .eq("profile_id", uid)
      .maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  }

  async function load() {
    const providerId = await getMyProviderId();
    if (!providerId) return setRows([]);

    let q = supabase
      .from("orders")
      .select(
        "id,type,status,price_cents,currency,provider_service_id,created_at"
      )
      .eq("provider_id", providerId) // ✅ scope
      .order("created_at", { ascending: false });
    if (status.length) q = q.in("status", status);
    if (type.length) q = q.in("type", type);
    const { data, error } = await q;
    if (error) console.error(error);
    setRows(data || []);
  }

  useEffect(() => {
    load();
  }, [status, type]);

  return (
    <div className="space-y-4">
      <Card title="Work Queue">
        <Filters
          label="Status"
          items={STATUS}
          value={status}
          onChange={setStatus}
        />
        <div className="h-2" />
        <Filters label="Type" items={TYPES} value={type} onChange={setType} />
        <div className="overflow-x-auto border border-[var(--border)] rounded-2xl mt-3">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card-800)]">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="p-3">{r.id.slice(0, 8)}…</td>
                  <td className="p-3">{r.type}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">
                    {r.price_cents != null
                      ? money(r.price_cents, r.currency)
                      : "-"}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4} className="p-6 text-[var(--ink-700)]">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Filters({ label, items, value, onChange }) {
  function toggle(it) {
    onChange(
      value.includes(it) ? value.filter((v) => v !== it) : [...value, it]
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--ink-700)]">{label}:</span>
      {items.map((it) => (
        <button
          key={it}
          onClick={() => toggle(it)}
          className={
            "px-2 py-1 rounded-lg border " +
            (value.includes(it)
              ? "bg-[var(--blue-600)] text-white border-transparent"
              : "border-[var(--border)]")
          }
        >
          {it}
        </button>
      ))}
    </div>
  );
}
