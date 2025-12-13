// /components/profile/ReviewsTab.jsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { dt } from "@/lib/format";
import { StarRating } from "@/components/ui/StarRating";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ReviewsTab({ providerId }) {
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!providerId) return;
    (async () => {
      const { data: sum } = await supabase.rpc("app.review_summary_provider", {
        p_provider_id: providerId,
      }); // optional RPC if you created it
      if (sum) setSummary(sum);
      const { data: r } = await supabase
        .from("app.reviews")
        .select("stars, comment, created_at as createdAt")
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false })
        .limit(20);
      setRows(r || []);
    })();
  }, [providerId]);

  return (
    <section className="max-w-3xl mx-auto px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <StarRating value={summary.avg || 0} />
        <div className="text-sm text-[var(--ink-700)]">
          {(summary.avg || 0).toFixed(1)} • {summary.count || 0} reviews
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--card-800)] text-center text-sm text-[var(--ink-700)]">
          No reviews yet — they appear after completed orders.
        </div>
      ) : (
        <ul className="grid gap-3">
          {rows.map((r, i) => (
            <li
              key={i}
              className="border border-[var(--border)] rounded-2xl p-4 bg-[var(--card-800)]"
            >
              <div className="flex items-center gap-2">
                <StarRating value={r.stars} />
                <span className="text-sm text-[var(--ink-700)]">
                  {dt(r.createdAt)}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
