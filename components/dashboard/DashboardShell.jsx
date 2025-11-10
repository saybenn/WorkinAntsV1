import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import RoleSwitcher from "./RoleSwitcher";
import Sidebar from "./parts/Sidebar";
import Topbar from "./parts/Topbar";
import Crossfade from "./parts/Crossfade";

// role components
import ClientOverview from "../roles/client/Overview";
import ClientBookings from "../roles/client/Bookings";
import ClientPurchases from "../roles/client/Purchases";
import ClientMessages from "../roles/client/Messages";
import ClientBilling from "../roles/client/Billing";
import ClientSaved from "../roles/client/Saved";

import ProviderOverview from "../roles/provider/Overview";
import ProviderOrders from "../roles/provider/Orders";
import ProviderAvailability from "../roles/provider/Availability";
import ProviderServices from "../roles/provider/Services";
import ProviderMessages from "../roles/provider/Messages";
import ProviderPayouts from "../roles/provider/Payouts";
import ProviderReviews from "../roles/provider/Reviews";
import ProviderAnalytics from "../roles/provider/Analytics";
import ProviderSettings from "../roles/provider/Settings";

import CandidateOverview from "../roles/candidate/Overview";
import CandidateJobs from "../roles/candidate/Jobs";
import CandidateApplications from "../roles/candidate/Applications";
import CandidateMessages from "../roles/candidate/Messages";
import CandidateProfile from "../roles/candidate/Profile";
import CandidateSettings from "../roles/candidate/Settings";

const TABS = {
  client: [
    { id: "overview", label: "Overview" },
    { id: "bookings", label: "Bookings" },
    { id: "purchases", label: "Purchases" },
    { id: "messages", label: "Messages" },
    { id: "billing", label: "Billing" },
    { id: "saved", label: "Saved" },
  ],
  provider: [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" }, // unified
    { id: "availability", label: "Availability" },
    { id: "services", label: "Services" },
    { id: "messages", label: "Messages" },
    { id: "payouts", label: "Payouts" },
    { id: "reviews", label: "Reviews" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ],
  candidate: [
    { id: "overview", label: "Overview" },
    { id: "jobs", label: "Jobs" },
    { id: "applications", label: "Applications" },
    { id: "messages", label: "Messages" },
    { id: "profile", label: "Profile" },
    { id: "settings", label: "Settings" },
  ],
};

export default function DashboardShell({ handle, initialRole }) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [tab, setTab] = useState(tabsByRole[role][0]);

  // update URL shallowly on role change
  useEffect(() => {
    const url = {
      pathname: router.pathname,
      query: { ...router.query, as: role },
    };
    router.replace(url, undefined, { shallow: true });
    setTab(tabsByRole[role][0]);
  }, [role]);

  const RoleTabs = tabsByRole[role];

  return (
    <div className="min-h-screen bg-[var(--bg-950)] text-[var(--ink-900)]">
      <Topbar handle={handle}>
        <RoleSwitcher role={role} setRole={setRole} />
      </Topbar>

      <div className="flex">
        <Sidebar tabs={RoleTabs} active={tab} onSelect={setTab} role={role} />
        <main className="flex-1 p-6">
          <Crossfade keyProp={`${role}:${tab}`}>
            {role === "client" &&
              (tab === "Overview" ? (
                <ClientOverview />
              ) : tab === "Bookings" ? (
                <ClientBookings />
              ) : tab === "Purchases" ? (
                <ClientPurchases />
              ) : tab === "Messages" ? (
                <ClientMessages />
              ) : tab === "Billing" ? (
                <ClientBilling />
              ) : (
                <ClientSaved />
              ))}
            {role === "provider" &&
              (tab === "Overview" ? (
                <ProviderOverview />
              ) : tab === "Orders" ? (
                <ProviderOrders />
              ) : tab === "Availability" ? (
                <ProviderAvailability />
              ) : tab === "Services" ? (
                <ProviderServices />
              ) : tab === "Messages" ? (
                <ProviderMessages />
              ) : tab === "Payouts" ? (
                <ProviderPayouts />
              ) : tab === "Reviews" ? (
                <ProviderReviews />
              ) : tab === "Analytics" ? (
                <ProviderAnalytics />
              ) : (
                <ProviderSettings />
              ))}
            {role === "candidate" &&
              (tab === "Overview" ? (
                <CandidateOverview />
              ) : tab === "Jobs" ? (
                <CandidateJobs />
              ) : tab === "Applications" ? (
                <CandidateApplications />
              ) : tab === "Messages" ? (
                <CandidateMessages />
              ) : tab === "Profile" ? (
                <CandidateProfile />
              ) : (
                <CandidateSettings />
              ))}
          </Crossfade>
        </main>
      </div>
    </div>
  );
}
