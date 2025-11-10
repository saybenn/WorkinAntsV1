import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function CandidateApplications() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("applications")
        .select("id,job_id,status,stage,submitted_at")
        .eq("candidate_id", uid)
        .order("submitted_at", { ascending: false });
      setRows(data || []);
    })();
  }, []);

  return (
    <Card title="Applications">
      {rows.length === 0 ? (
        <EmptyState
          title="No applications yet"
          subtitle="Apply to a job to see it here."
        />
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card-800)]">
              <tr>
                <th className="p-3">Application</th>
                <th className="p-3">Status</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="p-3">#{r.id.slice(0, 8)}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{r.stage}</td>
                  <td className="p-3">
                    {new Date(r.submitted_at).toLocaleDateString()}
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
