// components/roles/candidate/Jobs.jsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CandidateJobs() {
  const [jobs, setJobs] = useState([]);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("id,title,org_id,location,remote_ok,visibility,created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .then(({ data }) => setJobs(data || []));
  }, []);

  async function apply(jobId, orgId) {
    setBusy(jobId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) throw new Error("Not signed in.");

      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        candidate_id: uid,
        org_id: orgId,
        status: "submitted",
      });
      if (error) {
        if (error.code === "23505") {
          // unique violation
          // TODO: toast “Already applied”
          return;
        }
        throw error;
      }
      // TODO: toast “Applied!”
    } catch (e) {
      console.error(e);
      // TODO: toast error
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3">
      {jobs.map((j) => (
        <div
          key={j.id}
          className="border border-[var(--border)] rounded-xl p-4"
        >
          <div className="font-medium">{j.title}</div>
          <div className="text-sm text-[var(--ink-700)]">
            {j.location || (j.remote_ok ? "Remote" : "")}
          </div>
          <button
            onClick={() => apply(j.id, j.org_id)}
            disabled={busy === j.id}
            className="mt-2 px-3 py-1 rounded-lg bg-[var(--blue-600)] disabled:opacity-60"
          >
            {busy === j.id ? "Applying…" : "Apply"}
          </button>
        </div>
      ))}
      {jobs.length === 0 && <div>No jobs yet.</div>}
    </div>
  );
}
