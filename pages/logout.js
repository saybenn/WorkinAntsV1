// /pages/logout.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

const DRAFT_KEY = "onboarding_state_v1";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Supabase: end session (removes access/refresh tokens)
        await supabase.auth.signOut();
      } catch (e) {
        // no-op; even if this fails, we still clear local and redirect
        console.error("signOut error:", e);
      }

      // Clean localStorage artifacts
      try {
        // Onboarding draft
        localStorage.removeItem(DRAFT_KEY);

        // Any “setup dismissed” overlays we stored with key prefix `wv:setup_dismissed:`
        Object.keys(localStorage)
          .filter((k) => k.startsWith("wv:setup_dismissed:"))
          .forEach((k) => localStorage.removeItem(k));
      } catch {}

      // Send them home (or choose `/onboarding` if preferred)
      router.replace("/");
    })();
  }, [router]);

  return (
    <main className="min-h-screen grid place-items-center bg-(--bg-950) text-(--ink-900)">
      <div className="text-sm opacity-80">Signing you out…</div>
    </main>
  );
}
