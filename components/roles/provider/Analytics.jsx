import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { money } from "@/lib/format";

async function getProviderId() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const r = await fetch("/api/provider/ensure", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const p = await r.json();
  return p.id;
}

export default function ProviderAnalytics() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const pid = await getProviderId();
      const { data } = await supabase
        .from("provider_metrics_daily")
        .select("day,bookings_count,completed_count,avg_review,revenue_cents")
        .eq("provider_id", pid)
        .order("day", { ascending: false })
        .limit(14);
      setRows(data || []);
    })();
  }, []);

  return (
    <Card title="Last 14 days">
      {rows.length === 0 ? (
        <EmptyState title="No data yet" />
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card-800)]">
              <tr>
                <th className="p-3">Day</th>
                <th className="p-3">Bookings</th>
                <th className="p-3">Completed</th>
                <th className="p-3">Avg Review</th>
                <th className="p-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.day} className="border-t border-[var(--border)]">
                  <td className="p-3">
                    {new Date(r.day).toLocaleDateString()}
                  </td>
                  <td className="p-3">{r.bookings_count}</td>
                  <td className="p-3">{r.completed_count}</td>
                  <td className="p-3">{r.avg_review ?? "—"}</td>
                  <td className="p-3">{money(r.revenue_cents, "usd")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
