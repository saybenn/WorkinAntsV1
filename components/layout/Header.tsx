import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { appDb, supabase } from "@/lib/supabase/client";

type Props = { variant?: "overlay" | "solid" };

export default function Header({ variant = "overlay" }: Props) {
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);

  // ----- scroll behavior (your existing logic)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlayActive = variant === "overlay" && !scrolled;

  // ----- auth: get session on load + subscribe to changes
  useEffect(() => {
    let alive = true;

    async function loadAuth() {
      setLoadingAuth(true);

      try {
        // 1) Most reliable: ask Supabase "who is logged in?"
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) console.error("Header auth.getUser error:", userErr);

        const uid = userRes.user?.id ?? null;
        console.log("AUTH UID:", uid);

        if (!alive) return;

        setUserId(uid);

        // 2) If logged in, load handle from profiles
        if (uid) {
          const { data: profile, error: profErr } = await appDb
            .from("profiles")
            .select("handle")
            .eq("id", uid)
            .maybeSingle();
          console.log("PROFILE FOUND:", profile, profErr);

          if (profErr) console.error("Header profile load error:", profErr);

          if (!alive) return;
          setHandle(profile?.handle ?? null);
        } else {
          setHandle(null);
        }
      } finally {
        // 3) No matter what happens (even errors), stop showing "..."
        if (alive) setLoadingAuth(false);
      }
    }

    loadAuth();

    // 4) Listen for login/logout changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const uid = session?.user?.id ?? null;
        setUserId(uid);
        console.log("SESSION:", session?.user?.id, session?.user?.email);

        if (!uid) {
          setHandle(null);
          setLoadingAuth(false);
          return;
        }

        const { data: profile, error: profErr } = await appDb
          .from("profiles")
          .select("handle")
          .eq("id", uid)
          .maybeSingle();

        if (profErr)
          console.error("Header profile load error (state change):", profErr);

        setHandle(profile?.handle ?? null);
        setLoadingAuth(false);
      }
    );

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ----- handlers
  async function onSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const appName = useMemo(
    () => process.env.NEXT_PUBLIC_APP_NAME || "WorkinAnts",
    []
  );

  const dashboardHref = handle ? `/${handle}/dashboard` : "/post-auth";
  const profileHref = handle ? `/${handle}` : "/post-auth";

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-40 border-b transition-all",
        overlayActive
          ? "bg-transparent border-transparent"
          : "backdrop-blur bg-[var(--glass-bg)] border-[var(--border)]",
      ].join(" ")}
    >
      <div className="container-px mx-auto flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-semibold tracking-tight text-[var(--ink-900)]"
        >
          {appName}
        </Link>

        {/* Main nav */}
        <nav className="hidden items-center gap-6 md:flex text-[var(--ink-900)]">
          <Link href="/services" className="hover:opacity-80">
            Services
          </Link>
          <Link href="/providers" className="hover:opacity-80">
            Providers
          </Link>
          <Link href="/pricing" className="hover:opacity-80">
            Pricing
          </Link>

          {/* Auth area */}
          {loadingAuth ? (
            <span className="text-sm text-[var(--muted-400)]">...</span>
          ) : userId ? (
            <div className="flex items-center gap-4">
              <Link href={profileHref} className="hover:opacity-80 text-sm">
                {handle ? `@${handle}` : "My profile"}
              </Link>
              <Link
                href={dashboardHref}
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm hover:opacity-90"
              >
                Dashboard
              </Link>
              <button
                onClick={onSignOut}
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm hover:opacity-90"
                type="button"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hover:opacity-80">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile stub */}
        <div className="md:hidden">
          <span className="text-sm text-[var(--muted-400)]">Menu</span>
        </div>
      </div>
    </header>
  );
}
