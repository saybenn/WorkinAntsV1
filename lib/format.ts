// lib/format.ts

export const money = (cents?: number, curr = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: curr }).format((cents ?? 0) / 100);

export const when = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

export interface DtOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

/**
 * dt('2025-10-31T19:05:00Z') -> "Oct 31, 7:05 PM"
 * Accepts Date, ISO string, or epoch ms.
 */
export function dt(
  input: string | number | Date | null | undefined,
  opts: DtOptions = {}
): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  const format = new Intl.DateTimeFormat(opts.locale || undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...opts,
  });
  return format.format(d);
}

/** shortId('a1b2c3d4', 6) -> 'a1b2c3' */
export function shortId(id: string | number | null | undefined, n: number = 6): string {
  if (!id && id !== 0) return "—";
  return String(id).slice(0, n);
}

export const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

export const plural = (n: number, singular: string, pluralForm?: string): string =>
  n === 1 ? singular : (pluralForm ?? `${singular}s`);
