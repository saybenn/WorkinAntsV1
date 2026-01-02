import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { appDb, supabase } from "@/lib/supabase/client";

export default function PostAuthPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing sign-in...");

  useEffect(() => {
    let alive = true;

    async function run() {
      // 1) Confirm we actually have a logged-in user
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;

      if (error || !data.user) {
        setMsg("No session found. Sending you to login...");
        router.replace("/login");
        return;
      }

      const user = data.user;

      // 2) Fetch profile row (we only need handle)
      setMsg("Loading your profile...");
      const { data: profile, error: profErr } = await appDb
        .from("profiles")
        .select("handle")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;

      // 3) If profile missing, this user can’t be routed to /[u]
      if (profErr || !profile?.handle) {
        // Optional safety: sign out so demo doesn't get stuck in a weird state
        await supabase.auth.signOut();

        setMsg("Profile missing. Sending you to sign up...");
        router.replace("/signup?reason=missing_profile");
        return;
      }

      // 4) Redirect to /[u]
      router.replace(`/${profile.handle}`);
    }

    run();

    return () => {
      alive = false;
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "var(--bg-950)",
        color: "var(--ink-900)",
      }}
    >
      <p style={{ opacity: 0.85 }}>{msg}</p>
    </main>
  );
}
