import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

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

export default function ProviderReviews() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const pid = await getProviderId();
      const { data } = await supabase
        .from("reviews")
        .select("id,stars,comment,created_at")
        .eq("provider_id", pid)
        .order("created_at", { ascending: false });
      setRows(data || []);
    })();
  }, []);

  return (
    <Card title="Reviews">
      {rows.length === 0 ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="text-sm border-b border-[var(--border)] pb-2"
            >
              <div>⭐ {r.stars}/5</div>
              {r.comment && (
                <div className="text-[var(--ink-700)]">{r.comment}</div>
              )}
              <div className="text-xs text-[var(--ink-500)]">
                {new Date(r.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
