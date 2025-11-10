import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient"; // your v2 browser client

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 1) After redirect back from magic link / OAuth, Supabase will parse the URL and
  //    create a session. We watch auth state to kick off the handle redirect.
  useEffect(() => {
    // Initial check in case we already have a session
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await gotoHandle(data.session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user?.id) await gotoHandle(session.user.id);
      }
    );
    return () => sub?.subscription.unsubscribe();
  }, []);

  // 2) Send magic link
  async function sendMagicLink(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // When user clicks the link, they’ll land back on /login,
          // our effect above will detect the session & redirect to /u/[handle].
          emailRedirectTo: `${origin}/login`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setErr(e.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  }

  // 3) Google OAuth (optional)
  async function signInWithGoogle() {
    setErr("");
    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/login`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      // For OAuth, we'll be redirected; on return, onAuthStateChange handles it.
    } catch (e) {
      setErr(e.message || "OAuth sign-in failed.");
      setLoading(false);
    }
  }

  // 4) Resolve handle and go
  async function gotoHandle(userId) {
    // Ensure the profile row exists and grab the handle
    const { data, error } = await supabase
      .from("profiles")
      .select('handle, "isPublic"')
      .eq("id", userId)
      .maybeSingle();

    // If there’s no row yet (rare if your trigger is installed), just push to onboarding
    if (error || !data?.handle) {
      router.replace("/onboarding");
      return;
    }
    router.replace(`/u/${data.handle}?first=true`);
  }

  return (
    <>
      <Head>
        <title>Login — Wellvix</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen bg-[var(--bg-950)] text-[var(--ink-900)] grid place-items-center px-4">
        <div className="w-full max-w-md rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--card-800)] p-6">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-[var(--ink-700)]">
            Sign in to manage your profile and services.
          </p>

          <form onSubmit={sendMagicLink} className="mt-6 grid gap-3">
            <label className="text-sm">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-900)] px-3 py-2"
                placeholder="you@example.com"
              />
            </label>

            <button
              disabled={loading}
              className="mt-1 rounded-[var(--r-sm)] bg-[var(--green-500)] px-4 py-2 text-[var(--bg-950)] font-medium disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>

          <div className="my-4 text-center text-[var(--ink-700)] text-sm">
            or
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full rounded-[var(--r-sm)] bg-white/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            Continue with Google
          </button>

          {sent && (
            <div className="mt-4 rounded-[var(--r-sm)] bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm">
              Check your email for a sign-in link. Once you click it, you’ll
              come back here and we’ll send you to your profile automatically.
            </div>
          )}

          {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

          <p className="mt-6 text-[var(--ink-700)] text-xs">
            Trouble signing in? Make sure your Supabase <code>SITE_URL</code>{" "}
            and <code>redirectTo</code> match this page.
          </p>
        </div>
      </main>
    </>
  );
}
