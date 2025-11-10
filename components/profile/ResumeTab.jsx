// /components/profile/ResumeTab.jsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ResumeTab({ profileId }) {
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (!profileId) return;
    (async () => {
      const { data } = await supabase
        .from("app.candidate_profiles")
        .select(
          `headline, resume_url as resumeUrl, portfolio_url as portfolioUrl, availability, city, state, country`
        )
        .eq("user_id", profileId)
        .maybeSingle();
      setResume(data || null);
    })();
  }, [profileId]);

  if (!resume) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-4">
        <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--card-800)] text-center text-sm text-[var(--ink-700)]">
          No resume information provided.
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-4">
      <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--card-800)]">
        <h3 className="font-medium text-lg">{resume.headline || "Resume"}</h3>
        <div className="mt-2 text-sm text-[var(--ink-700)]">
          {resume.city || resume.state || resume.country
            ? [resume.city, resume.state, resume.country]
                .filter(Boolean)
                .join(", ")
            : null}
        </div>
        <ul className="mt-4 text-sm grid gap-2">
          {resume.availability && <li>Availability: {resume.availability}</li>}
          {resume.resumeUrl && (
            <li>
              <a
                className="underline"
                href={resume.resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                View résumé
              </a>
            </li>
          )}
          {resume.portfolioUrl && (
            <li>
              <a
                className="underline"
                href={resume.portfolioUrl}
                target="_blank"
                rel="noreferrer"
              >
                View portfolio
              </a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
