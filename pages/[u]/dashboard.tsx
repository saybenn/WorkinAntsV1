// pages/[u]/dashboard.tsx
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import AppShell from "../../components/app/AppShell";
import SidebarNav from "../../components/app/SidebarNav";
import SidebarModeSwitcher from "../../components/app/SidebarModeSwitcher";
import TopNav from "../../components/app/TopNav";
import MainContentRouter from "../../components/dashboard/MainContentRouter";

import { supabaseServerClient } from "../../lib/supabase/server";
import { getDefaultModeFromRoleSet } from "../../lib/role";
import { track } from "../../lib/analytics";

type DbUserRole = "client" | "provider" | "candidate" | "employer" | "admin";
type UIMode = "client" | "professional" | "job_seeker" | "organization";

type DashboardView =
  | "home"
  | "search"
  | "categories"
  | "saved"
  | "orders"
  | "messages"
  | "postJob";

type DbProfile = {
  id: string; // auth user id
  handle: string;
  full_name: string | null;
  avatar_url: string | null;
  role: DbUserRole | null;
  role_set: DbUserRole[] | null;
  is_public: boolean | null;
};

type InitialError = "PROFILE_LOAD_ERROR" | "PROFILE_NOT_FOUND" | null;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const supabase = supabaseServerClient(ctx);
  const u = String(ctx.params?.u || "").trim();

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) {
    return {
      redirect: {
        destination: `/login?next=/${encodeURIComponent(u)}/dashboard`,
        permanent: false,
      },
    };
  }

  // IMPORTANT: select string must be clean and parser-safe
  const { data: profile, error } = await supabase
    // if this table is in public, remove .schema("app")
    .schema("app")
    .from("profiles")
    .select("id, handle, full_name, avatar_url, role, role_set, is_public")
    .eq("handle", u)
    .maybeSingle<DbProfile>();

  if (error) {
    console.error("PROFILE_LOAD_ERROR", error);
    return {
      props: {
        u,
        profile: null,
        initialError: "PROFILE_LOAD_ERROR" as InitialError,
      },
    };
  }

  if (!profile) {
    return {
      props: {
        u,
        profile: null,
        initialError: "PROFILE_NOT_FOUND" as InitialError,
      },
    };
  }

  // Ownership check (your schema uses profiles.id as auth user id)
  if (profile.id !== user.id) {
    return { redirect: { destination: "/403", permanent: false } };
  }

  return { props: { u, profile, initialError: null as InitialError } };
}

export default function DashboardPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  // hooks MUST run before returns
  const router = useRouter();

  const { u, profile, initialError } = props;

  const [activeView, setActiveView] = useState<DashboardView>("home");

  const initialMode: UIMode = useMemo(() => {
    const rs = (profile?.role_set ?? ["client"]) as DbUserRole[];
    return getDefaultModeFromRoleSet(rs);
  }, [profile?.role_set]);

  const [activeMode, setActiveMode] = useState<UIMode>(initialMode);

  useEffect(() => {
    setActiveMode(initialMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode]);

  useEffect(() => {
    const view = router.query.view;
    if (typeof view !== "string") return;
    const allowed: DashboardView[] = [
      "home",
      "search",
      "categories",
      "saved",
      "orders",
      "messages",
      "postJob",
    ];
    if (allowed.includes(view as DashboardView))
      setActiveView(view as DashboardView);
  }, [router.query.view]);

  const changeView = (view: DashboardView) => {
    setActiveView(view);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, view } },
      undefined,
      { shallow: true }
    );
    track("dashboard_view", { view });
  };

  const startOnboarding = (mode: UIMode) => {
    track("mode_onboarding_prompt", { mode });
    alert(`Onboarding required to enable: ${mode}`);
  };

  if (initialError === "PROFILE_NOT_FOUND") {
    return (
      <div style={{ padding: 24, color: "white" }}>
        <h1>Profile not found</h1>
        <p style={{ opacity: 0.75 }}>No dashboard exists for “{u}”.</p>
      </div>
    );
  }

  if (initialError === "PROFILE_LOAD_ERROR") {
    return (
      <div style={{ padding: 24, color: "white" }}>
        <h1>Something went wrong</h1>
        <p style={{ opacity: 0.75 }}>
          We couldn’t load your dashboard. Refresh and try again.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: 24, color: "white" }}>
        <h1>Loading…</h1>
      </div>
    );
  }

  // TEMP ADAPTER: satisfy MainContentRouter's old Profile shape without rewriting it right now
  const adaptedProfile = {
    id: profile.id,
    user_id: profile.id, // legacy field expected by MainContentRouter
    username: profile.handle, // legacy field expected by MainContentRouter
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    role: profile.role,
    role_set: profile.role_set,
  };

  return (
    <AppShell
      sidebar={
        <SidebarNav activeView={activeView} onViewChange={changeView}>
          <SidebarModeSwitcher
            role_set={(profile.role_set ?? ["client"]) as DbUserRole[]}
            onModeChange={(m: UIMode) => {
              setActiveMode(m);
              track("mode_change", { mode: m });
            }}
            onStartOnboarding={startOnboarding}
          />
        </SidebarNav>
      }
      topbar={
        <TopNav
          onScopeChange={(scope: "services" | "products" | "courses") => {
            track("scope_change", { scope });
          }}
          onSearchSubmit={({
            q,
            scope,
          }: {
            q: string;
            scope: "services" | "products" | "courses";
          }) => {
            track("search_submit", { scope, q_len: q.length });
            changeView("search");
            router.replace(
              {
                pathname: router.pathname,
                query: { ...router.query, view: "search", q, scope },
              },
              undefined,
              { shallow: true }
            );
          }}
        />
      }
    >
      <MainContentRouter
        u={u}
        profile={adaptedProfile as any}
        activeView={activeView}
        activeMode={activeMode}
        onModeChange={(m: UIMode) => setActiveMode(m)}
        onViewChange={changeView}
      />
    </AppShell>
  );
}
