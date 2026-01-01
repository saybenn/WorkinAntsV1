import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { GetServerSidePropsContext } from "next";

export function supabaseServerClient(ctx: GetServerSidePropsContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return ctx.req.cookies[name];
      },
      set(name: string, value: string, options: CookieOptions) {
        ctx.res.setHeader("Set-Cookie", serializeCookie(name, value, options));
      },
      remove(name: string, options: CookieOptions) {
        ctx.res.setHeader("Set-Cookie", serializeCookie(name, "", { ...options, maxAge: 0 }));
      },
    },
  });
}

// Minimal cookie serializer (no dependency). You can swap to `cookie` package if preferred.
function serializeCookie(name: string, value: string, options: CookieOptions) {
  const opt = {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    ...options,
  };

  let str = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (opt.maxAge !== undefined) str += `; Max-Age=${opt.maxAge}`;
  if (opt.expires) str += `; Expires=${opt.expires.toUTCString()}`;
  if (opt.path) str += `; Path=${opt.path}`;
  if (opt.domain) str += `; Domain=${opt.domain}`;
  if (opt.sameSite) str += `; SameSite=${opt.sameSite}`;
  if (opt.secure) str += `; Secure`;
  if (opt.httpOnly) str += `; HttpOnly`;
  return str;
}
