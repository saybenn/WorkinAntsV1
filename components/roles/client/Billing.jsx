import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { money } from "@/lib/format";

export default function ClientBilling() {
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
        .select("id,price_cents,currency,status,paid_at,created_at")
        .eq("client_id", uid)
        .not("paid_at", "is", null)
        .order("paid_at", { ascending: false })
        .limit(10);
      setRows(data || []);
    })();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Billing portal">
        <EmptyState
          title="Stripe portal coming soon"
          subtitle="Update payment methods and view invoices."
          action={
            <a className="underline" href="#">
              Open portal
            </a>
          }
        />
      </Card>
      <Card title="Recent payments">
        {rows.length === 0 ? (
          <EmptyState title="No payments yet" />
        ) : (
          <ul className="text-sm space-y-2">
            {rows.map((r) => (
              <li key={r.id}>
                #{r.id.slice(0, 8)} — {money(r.price_cents, r.currency)} •{" "}
                {r.status}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
