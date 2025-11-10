// components/roles/client/Bookings.jsx
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { dt } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";

export default function ClientBookings() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("client_id", uid) // ✅
        .order("scheduled_start", { ascending: true });
      setRows(data || []);
    })();
  }, []);

  async function cancel(bookingId) {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("client_cancel_booking", {
        p_booking: bookingId,
      });
      if (error) throw error;
      setRows((rs) =>
        rs.map((r) => (r.id === bookingId ? { ...r, status: "cancelled" } : r))
      );
    } catch (e) {
      console.error(e);
      // TODO: toast error
    } finally {
      setBusy(false);
    }
  }

  if (!rows.length) return <EmptyState title="No bookings yet" />;

  return (
    <div className="overflow-x-auto border border-[var(--border)] rounded-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-3">When</th>
            <th>Order</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[var(--border)]">
              <td className="p-3">{dt(r.scheduled_start)}</td>
              <td className="p-3">{r.order_id?.slice(0, 6)}</td>
              <td className="p-3">{r.status}</td>
              <td className="p-3 text-right">
                {r.status === "confirmed" && (
                  <button
                    onClick={() => cancel(r.id)}
                    disabled={busy}
                    className="px-3 py-1 rounded-lg border disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
