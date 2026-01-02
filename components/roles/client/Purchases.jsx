import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { money } from "@/lib/format";

export default function ClientPurchases() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      const { data } = await supabase
        .from("orders")
        .select("id,status,price_cents,currency,created_at,service_id,type")
        .eq("client_id", uid)
        .eq("type", "digital")
        .order("created_at", { ascending: false });
      setRows(data || []);
    })();
  }, []);

  return (
    <Card title="Purchases">
      {rows.length === 0 ? (
        <EmptyState
          title="No purchases yet"
          subtitle="Buy a digital service to see it here."
        />
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card-800)]">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Status</th>
                <th className="p-3">Price</th>
                <th className="p-3">Placed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="p-3">#{r.id.slice(0, 8)}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{money(r.price_cents, r.currency)}</td>
                  <td className="p-3">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
