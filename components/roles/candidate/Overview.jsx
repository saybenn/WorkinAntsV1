// components/roles/candidate/Overview.jsx
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function CandidateOverview() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    supabase
      .from("jobs")
      .select("id,title,employment_type,location,remote_ok,created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setJobs(data || []));
  }, []);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Suggested jobs">
        {jobs.length ? (
          <ul className="text-sm space-y-2">
            {jobs.map((j) => (
              <li key={j.id}>
                {j.title} — {j.location || (j.remote_ok ? "Remote" : "")}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No suggestions yet"
            subtitle="Add skills and set your location."
          />
        )}
      </Card>
      <Card title="Applications">
        <EmptyState
          title="No applications yet"
          subtitle="Browse jobs to apply."
        />
      </Card>
    </div>
  );
}
