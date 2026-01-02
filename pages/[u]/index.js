// /pages/u/[handle].js
import Head from "next/head";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

import Breadcrumbs from "@/components/profile/Breadcrumbs";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Tabs from "@/components/profile/Tabs";
import ServicesTab from "@/components/profile/ServicesTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import ResumeTab from "@/components/profile/ResumeTab";
import AboutTab from "@/components/profile/AboutTab";
import BottomBar from "@/components/profile/BottomBar";
import { appDb } from "@/lib/supabase/client";

// ---------- SSR: public profile ----------
export async function getServerSideProps(ctx) {
  const handle = String(ctx.params.handle || "").toLowerCase();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: profile, error } = await supabase
    .schema("app")
    .from("v_profiles")
    .select(
      `
      id,
      handle,
      fullName:full_name,
      avatarUrl:avatar_url,
      role,
      roleSet:role_set,
      bio,
      location,
      isPublic:is_public,
      createdAt:created_at
    `
    )
    .eq("handle", handle)
    .maybeSingle();

  if (error || !profile) {
    console.error("[SSR /u/:handle] select error:", error);
    return { notFound: true };
  }
  return { props: { initialProfile: profile } };
}

export default function PublicProfile({ initialProfile }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [provider, setProvider] = useState(null);
  const [skills, setSkills] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    avgReview: 0,
    reviewCount: 0,
  });
  const [fav, setFav] = useState(false);

  // owner + edit state
  const [editMode, setEditMode] = useState(() => router.query.edit === "1");
  const [draftName, setDraftName] = useState(initialProfile.fullName || "");
  const [draftBio, setDraftBio] = useState(initialProfile.bio || "");
  const [saving, setSaving] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");

  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
    []
  );

  // session
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session || null));
  }, [supabase]);

  const isOwner = !!session && session.user?.id === initialProfile.id;

  // public reads
  useEffect(() => {
    (async () => {
      const { data: prov } = await supabase
        .schema("app")
        .from("providers")
        .select(`id, displayName:display_name, city, state, country, rating`)
        .eq("profile_id", initialProfile.id)
        .maybeSingle();

      let tier = null;
      if (prov?.id) {
        const { data: rank } = await supabase
          .schema("app")
          .from("provider_ranks")
          .select(`tier`)
          .eq("provider_id", prov.id)
          .maybeSingle();
        tier = rank?.tier || null;
      }
      setProvider(prov ? { ...prov, tier } : null);

      // skills
      const { data: userSkills } = await supabase
        .schema("app")
        .from("user_skills")
        .select("tag_id, verified")
        .eq("user_id", initialProfile.id);

      if (userSkills?.length) {
        const tagIds = [...new Set(userSkills.map((u) => u.tag_id))];
        const { data: tags } = await supabase
          .schema("app")
          .from("taxonomy_tags")
          .select("id, name")
          .in("id", tagIds);
        const tagMap = Object.fromEntries(
          (tags || []).map((t) => [t.id, t.name])
        );
        setSkills(
          userSkills.map((u) => ({
            tag: tagMap[u.tag_id] || "—",
            verified: u.verified,
          }))
        );
      } else {
        setSkills([]);
      }

      // reviews
      if (prov?.id) {
        const { data: rows } = await supabase
          .schema("app")
          .from("reviews")
          .select("stars", { count: "exact", head: false })
          .eq("provider_id", prov.id);

        const stars = (rows || []).map((r) => r.stars);
        const avg = stars.length
          ? Math.round((stars.reduce((a, b) => a + b, 0) / stars.length) * 10) /
            10
          : 0;
        setReviewSummary({ avgReview: avg, reviewCount: stars.length });
      } else {
        setReviewSummary({ avgReview: 0, reviewCount: 0 });
      }
    })();
  }, [supabase, initialProfile.id]);

  // ----- Owner actions -----
  const saveProfile = useCallback(async () => {
    if (!isOwner) return;
    setSaving(true);
    setBannerMsg("");
    try {
      const { error } = await appDb
        .from("profiles")
        .update({ full_name: draftName || null, bio: draftBio || null })
        .eq("id", initialProfile.id)
        .single();

      if (error) throw error;
      setBannerMsg("✅ Saved");
    } catch (e) {
      setBannerMsg(e.message || "Save failed");
    } finally {
      setSaving(false);
      // refresh SSR data client-side to reflect changes quickly
      router.replace(router.asPath, undefined, { scroll: false });
    }
  }, [isOwner, supabase, draftName, draftBio, initialProfile.id, router]);
  console.log(initialProfile);
  const gotoDashboard = () =>
    router.push(`/u/${initialProfile.handle}/dashboard`);
  const addService = () =>
    router.push(
      `/u/${initialProfile.handle}/dashboard?as=provider&tab=services&intent=new`
    );
  const manageAvailability = () =>
    router.push(
      `/u/${initialProfile.handle}/dashboard?as=provider&tab=calendar`
    );

  // ----- Share / Favorite -----
  function onShare() {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/u/${
      initialProfile.handle
    }`;
    if (navigator.share) {
      navigator.share({
        title: initialProfile.fullName || `@${initialProfile.handle}`,
        url,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert("Profile link copied!");
    }
  }
  function onFavorite() {
    setFav((v) => !v);
  }

  // privacy
  if (!initialProfile.isPublic && !isOwner) {
    return (
      <main className="min-h-screen bg-[var(--bg-950)] text-[var(--ink-900)]">
        <Breadcrumbs handle={initialProfile.handle} />
        <section className="max-w-3xl mx-auto px-4 py-10">
          <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--card-800)]">
            <h1 className="text-xl font-semibold">@{initialProfile.handle}</h1>
            <p className="mt-2 text-[var(--ink-700)]">
              This profile is private.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const pageTitle = `${
    initialProfile.fullName || `@${initialProfile.handle}`
  } • Wellvix`;

  // Tabs: show Services to everyone if a provider exists
  const tabs = [
    ...(provider ? [{ id: "services", label: "Services" }] : []),
    { id: "portfolio", label: "Portfolio" },
    { id: "reviews", label: "Reviews" },
    { id: "resume", label: "Resume" },
    { id: "about", label: "About" },
  ];

  const qtab = router.query.tab;
  const active =
    (Array.isArray(qtab) ? qtab[0] : qtab) || (provider ? "services" : "about");

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={initialProfile.bio || "Wellvix profile"}
        />
      </Head>

      <main className="min-h-screen bg-[var(--bg-950)] text-[var(--ink-900)] pb-20">
        <Breadcrumbs handle={initialProfile.handle} />

        {/* Owner Bar */}
        {isOwner && (
          <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-950)]/85 backdrop-blur">
            <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--ink-700)] mr-2">
                Owner controls
              </span>
              <button
                onClick={() => setEditMode((v) => !v)}
                className="rounded-[var(--r-sm)] bg-white/10 px-3 py-2 text-sm"
              >
                {editMode ? "Exit edit mode" : "Edit profile"}
              </button>
              <button
                onClick={gotoDashboard}
                className="rounded-[var(--r-sm)] bg-white/10 px-3 py-2 text-sm"
              >
                Open Dashboard
              </button>
              {provider && (
                <>
                  <button
                    onClick={addService}
                    className="rounded-[var(--r-sm)] bg-white/10 px-3 py-2 text-sm"
                  >
                    Add Service
                  </button>
                  <button
                    onClick={manageAvailability}
                    className="rounded-[var(--r-sm)] bg-white/10 px-3 py-2 text-sm"
                  >
                    Manage Availability
                  </button>
                </>
              )}
              {!!bannerMsg && (
                <span className="ml-auto text-sm">{bannerMsg}</span>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <ProfileHeader
          profile={{
            ...initialProfile,
            // reflect live draft in header while editing
            fullName: editMode ? draftName : initialProfile.fullName,
            bio: editMode ? draftBio : initialProfile.bio,
          }}
          provider={provider}
          skills={skills}
          metrics={reviewSummary}
          isOwner={isOwner}
          onShare={onShare}
          onFavorite={onFavorite}
          isFav={fav}
        />

        {/* Inline Edit Card (owner only, toggled) */}
        {isOwner && editMode && (
          <section className="max-w-3xl mx-auto px-4">
            <div className="mt-4 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--card-800)] p-4">
              <div className="grid gap-3">
                <label className="text-sm">
                  <div className="mb-1 text-[var(--ink-700)]">Display name</div>
                  <input
                    className="w-full rounded-[var(--r-sm)] bg-[var(--bg-900)] border border-[var(--border)] px-3 py-2"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Your public name"
                    maxLength={80}
                  />
                </label>
                <label className="text-sm">
                  <div className="mb-1 text-[var(--ink-700)]">Bio</div>
                  <textarea
                    className="w-full rounded-[var(--r-sm)] bg-[var(--bg-900)] border border-[var(--border)] px-3 py-2 min-h-[100px]"
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    placeholder="A short intro about you"
                    maxLength={600}
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="rounded-[var(--r-sm)] bg-[var(--green-500)] px-4 py-2 text-[var(--bg-950)]"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setDraftName(initialProfile.fullName || "");
                      setDraftBio(initialProfile.bio || "");
                    }}
                    className="rounded-[var(--r-sm)] bg-white/10 px-4 py-2"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <Tabs handle={initialProfile.handle} tabs={tabs} />

        {/* Tab content */}
        {active === "services" && provider && (
          <ServicesTab providerId={provider.id} />
        )}
        {active === "reviews" && provider && (
          <ReviewsTab providerId={provider.id} />
        )}
        {active === "resume" && <ResumeTab profileId={initialProfile.id} />}
        {active === "about" && (
          <AboutTab bio={editMode ? draftBio : initialProfile.bio} />
        )}
        {active === "portfolio" && (
          <section className="max-w-3xl mx-auto px-4 py-6 text-[var(--ink-700)]">
            Portfolio coming soon.
          </section>
        )}

        {/* Sticky bottom CTA */}
        <BottomBar handle={initialProfile.handle} providerExists={!!provider} />
      </main>
    </>
  );
}
