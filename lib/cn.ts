// lib/cn.ts
export function cn(...classes: Array<string | false | null | undefined>) {
  // - Joins class tokens safely
  // - Normalizes whitespace so SSR and client produce identical strings (fixes hydration mismatches)
  return classes
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
