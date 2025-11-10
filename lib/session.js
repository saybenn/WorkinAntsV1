// /lib/session.js
import { supabaseServerClient } from "@/lib/supabaseServer";

/** Returns { user, token } or { user: null, token: null } */
export async function getSessionUser(req) {
  // 1) Try Authorization header first (our fetch will set it)
  const auth = req.headers.authorization || req.headers.Authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  // 2) Optional fallback: cookie named sb-access-token (only if you set it elsewhere)
  const cookieToken =
    token ||
    req.headers.cookie
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("sb-access-token="))
      ?.split("=")[1] ||
    null;

  if (!cookieToken) return { user: null, token: null };

  // 3) Use your server client "as the user"
  const supa = supabaseServerClient(cookieToken);

  // In @supabase/supabase-js v2, getUser can accept a token param; we pass it explicitly.
  const { data, error } = await supa.auth.getUser(cookieToken);
  if (error) return { user: null, token: null };

  return { user: data.user || null, token: cookieToken };
}
