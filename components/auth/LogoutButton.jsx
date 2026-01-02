// /components/auth/LogoutButton.jsx
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/client";

const DRAFT_KEY = "onboarding_state_v1";

export default function LogoutButton({
  className = "px-3 py-2 rounded-lg border border-(--border) hover:bg-white/5",
  children = "Log out",
  redirectTo = "/",
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("signOut error:", e);
    }
    try {
      localStorage.removeItem(DRAFT_KEY);
      Object.keys(localStorage)
        .filter((k) => k.startsWith("wv:setup_dismissed:"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
    router.replace(redirectTo);
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
