// components/roles/client/Overview.jsx
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { money, dt } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";

export default function ClientOverview() {
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      const [{ data: o }, { data: b }, { data: t }] = await Promise.all([
        supabase
          .from("orders")
          .select("id,type,status,price_cents,currency,created_at")
          .eq("client_id", uid)
          .in("status", ["awaiting_provider", "accepted", "delivered"])
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("bookings")
          .select("id,order_id,status,scheduled_start,scheduled_end")
          .eq("client_id", uid) // ✅ scope to me
          .in("status", ["confirmed"])
          .order("scheduled_start", { ascending: true })
          .limit(3),
        supabase
          .from("v_message_threads")
          .select("*")
          .like("thread_id", "order:%")
          .order("last_at", { ascending: false })
          .limit(3),
      ]);
      setOrders(o || []);
      setBookings(b || []);
      setThreads(t || []);
    })();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Upcoming & Active">
        {orders.length === 0 && bookings.length === 0 ? (
          <EmptyState
            title="Nothing in progress"
            subtitle="Browse providers to get started."
            action={
              <a className="underline" href="/search?type=services">
                Find providers
              </a>
            }
          />
        ) : (
          <div className="space-y-2 text-sm">
            {bookings.map((b) => (
              <div key={b.id}>Booking • {dt(b.scheduled_start)}</div>
            ))}
            {orders.map((o) => (
              <div key={o.id}>
                Order #{o.id.slice(0, 6)} • {o.status} •{" "}
                {money(o.price_cents, o.currency)}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Inbox">
        {threads.length === 0 ? (
          <EmptyState title="No messages yet" />
        ) : (
          <ul className="text-sm space-y-2">
            {threads.map((t) => (
              <li key={t.thread_id}>{t.thread_id}</li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Billing">
        <EmptyState
          title="Stripe portal coming soon"
          subtitle="Invoices and refunds will appear here."
        />
      </Card>

      <Card title="Saved">
        <EmptyState
          title="No favorites yet"
          subtitle="Save providers and services as you browse."
        />
      </Card>
    </div>
  );
}
