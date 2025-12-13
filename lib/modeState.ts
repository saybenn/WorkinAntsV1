import { Mode } from "./homeContent";

const MODE_KEY = "wa_home_mode";

export function parseMode(raw: string | string[] | undefined): Mode | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return null;
  if (v === "customer" || v === "professional" || v === "careerSeeker" || v === "employer") {
    return v;
  }
  return null;
}

export function getModeFromLocalStorage(): Mode | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(MODE_KEY);
  return parseMode(stored);
}

export function saveModeToLocalStorage(mode: Mode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
}

// stub – you’ll replace with real Supabase call
export async function getModeFromSupabase(): Promise<Mode | null> {
  // e.g. const { data } = await supabase.from("profiles").select("home_mode").single();
  return null;
}

export async function saveModeToSupabase(mode: Mode): Promise<void> {
  // e.g. supabase.from("profiles").update({ home_mode: mode }).eq("id", user.id);
}
