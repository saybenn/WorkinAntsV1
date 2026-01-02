// Extracts the current user + token in API routes
import { supabaseServerClient } from "@/lib/supabase/server";

/** Returns { user, token } or { user: null, token: null } */
export async function getSessionUser(req) {
  // 1) Authorization: Bearer <jwt>
  const auth = req.headers.authorization || req.headers.Authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  // 2) Fallback cookie (only if you set it yourself)
  const cookieToken =
    token ||
    req.headers.cookie
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("sb-access-token="))
      ?.split("=")[1] ||
    null;

  if (!cookieToken) return { user: null, token: null };

  // Validate token and fetch user via as-user client
  const supa = supabaseServerClient(cookieToken);
  const { data, error } = await supa.auth.getUser(cookieToken);
  if (error) return { user: null, token: null };

  return { user: data.user || null, token: cookieToken };
}
