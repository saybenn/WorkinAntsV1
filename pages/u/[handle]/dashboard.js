import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Suspense, useMemo } from "react";
import RoleSwitcher from "@/components/dashboard/parts/RoleSwitcher";
import Skeleton from "@/components/ui/Skeleton";

const ProviderView = dynamic(
  () => import("@/components/roles/provider/ProviderView"),
  { ssr: false }
);
const ClientView = dynamic(
  () => import("@/components/roles/client/ClientView"),
  { ssr: false }
);
const CandidateView = dynamic(
  () => import("@/components/roles/candidate/CandidateView"),
  { ssr: false }
);

export default function Dashboard() {
  const router = useRouter();
  const role = useMemo(
    () => (router.query.as ? String(router.query.as) : "client"),
    [router.query.as]
  );

  return (
    <div className="min-h-screen bg-[var(--bg-950)] text-[var(--ink-900)]">
      {/* Sticky role switcher header */}
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-950)]/80 backdrop-blur">
        <div className="px-4 py-3">
          <RoleSwitcher />
        </div>
      </div>

      {/* Each role view owns its own sidebar + tabs */}
      <Suspense
        fallback={
          <div className="p-6">
            <Skeleton className="h-8 w-44" />
            <div className="h-4" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        {role === "provider" ? (
          <ProviderView />
        ) : role === "candidate" ? (
          <CandidateView />
        ) : (
          <ClientView />
        )}
      </Suspense>
    </div>
  );
}
