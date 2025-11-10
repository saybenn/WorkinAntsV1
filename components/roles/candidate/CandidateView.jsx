import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/dashboard/Sidebar";

import CandidateOverview from "./Overview";
import CandidateJobs from "./Jobs";
import CandidateApplications from "./Applications";
import CandidateMessages from "./Messages";
import CandidateProfile from "./Profile";
import CandidateSettings from "./Settings";

const TABS = [
  { id: "overview", label: "Overview", component: CandidateOverview },
  { id: "jobs", label: "Jobs", component: CandidateJobs },
  {
    id: "applications",
    label: "Applications",
    component: CandidateApplications,
  },
  { id: "messages", label: "Messages", component: CandidateMessages },
  { id: "profile", label: "Profile", component: CandidateProfile },
  { id: "settings", label: "Settings", component: CandidateSettings },
];

export default function CandidateView() {
  const router = useRouter();
  const tabFromUrl = router.query.tab;
  const [active, setActive] = useState(tabFromUrl || "overview");

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== active) setActive(tabFromUrl);
  }, [tabFromUrl]);

  function handleSelect(id) {
    setActive(id);
    router.replace({ query: { ...router.query, tab: id } }, undefined, {
      shallow: true,
    });
  }

  const ActiveComponent =
    TABS.find((t) => t.id === active)?.component || CandidateOverview;

  return (
    <div className="flex min-h-[70vh] transition-opacity duration-300">
      <Sidebar
        tabs={TABS}
        active={active}
        onSelect={handleSelect}
        role="Candidate"
      />
      <main className="flex-1 p-6 bg-[var(--bg-950)] text-[var(--ink-900)] fade-in">
        <ActiveComponent key={active} />
      </main>
    </div>
  );
}
