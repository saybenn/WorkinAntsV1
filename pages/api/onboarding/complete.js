// /pages/api/onboarding/complete.js
import { supabaseServerClient } from "@/lib/supabase/server";

/**
 * Truth mode:
 * - Require POST + Bearer token
 * - Normalize role from intent (orgs begin as "client")
 * - Call namespaced RPC (app.onboarding_envelope)
 * - Return explicit errors
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { intent, role: roleFromBody, handle, avatarUrl } = req.body || {};
    const role =
      roleFromBody ?? (intent === "organization" ? "client" : intent); // orgs start as client

    if (!role || !handle) {
      return res.status(400).json({
        error: "Missing fields: role/intent and handle are required.",
      });
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No bearer token." });

    const supa = supabaseServerClient(token);

    // IMPORTANT: qualify the function with schema if it lives in app
    const { error } = await supa.schema("app").rpc("onboarding_envelope", {
      new_role: role,
      new_handle: handle,
      new_avatar_url: avatarUrl || null,
    });

    if (error) {
      console.error("[onboarding/complete] RPC error:", error);
      return res.status(400).json({ error: error.message, code: error.code });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[onboarding/complete] Server error:", e);
    return res.status(500).json({ error: "Server error." });
  }
}
