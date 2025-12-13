// lib/mode.ts
import type { Mode } from "./homeContent";

const MODE_KEY = "wa_home_mode";

// Reusable guard
function isMode(v: string): v is Mode {
  return (
    v === "customer" ||
    v === "professional" ||
    v === "careerSeeker" ||
    v === "employer"
  );
}

/**
 * Accepts querystring shapes (string | string[] | undefined)
 * AND localStorage shapes (string | null).
 */
export function parseMode(
  raw: string | string[] | undefined | null
): Mode | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return null;
  return isMode(v) ? v : null;
}

export function getModeFromLocalStorage(): Mode | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(MODE_KEY); // string | null
  return parseMode(stored);
}

export function saveModeToLocalStorage(mode: Mode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
}

// stub – replace with real Supabase call
export async function getModeFromSupabase(): Promise<Mode | null> {
  return null;
}

export async function saveModeToSupabase(_mode: Mode): Promise<void> {
  return;
}
