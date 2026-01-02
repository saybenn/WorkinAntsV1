import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabase/client"; // adjust if needed

type DbUserRole = "client" | "provider" | "candidate" | "employer";

const ROLE_OPTIONS: Array<{
  label: string;
  value: DbUserRole;
  help: string;
}> = [
  {
    label: "Client",
    value: "client",
    help: "Hire pros, buy products, book services.",
  },
  {
    label: "Professional",
    value: "provider",
    help: "Offer services, sell products/courses.",
  },
  {
    label: "Job Seeker",
    value: "candidate",
    help: "Find roles, apply, build a profile.",
  },
  {
    label: "Organization",
    value: "employer",
    help: "Post jobs, manage hiring, run teams.",
  },
];

function slugHandle(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function SignupPage() {
  const router = useRouter();

  const [handle, setHandle] = useState("");
  const [role, setRole] = useState<DbUserRole>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const cleanHandle = slugHandle(handle);

    if (!cleanHandle) return setErr("Choose a handle (letters/numbers only).");
    if (!email) return setErr("Enter an email.");
    if (password.length < 6)
      return setErr("Password must be at least 6 characters.");

    setLoading(true);
    try {
      // 0) Ensure handle isn't taken
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("handle", cleanHandle)
        .maybeSingle();

      if (existing?.id) {
        throw new Error("That handle is already taken. Choose another.");
      }

      // 1) Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) {
        throw new Error(
          "Signup created no session (email confirmation may be enabled). For demo, disable email confirmation."
        );
      }

      // 2) Create profile row in app.profiles
      // Your browser client is configured with db.schema="app"
      const { error: profErr } = await supabase.from("profiles").insert({
        id: user.id,
        handle: cleanHandle,
        full_name: null,
        avatar_url: null,
        role, // primary role
        role_set: [role], // allowed roles (starting with one)
        is_public: true,
      });

      if (profErr) throw profErr;

      // 3) Route to /[u]
      router.push(`/post-auth}`);
    } catch (e: any) {
      setErr(e?.message ?? "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        color: "white",
        background: "#06142e",
      }}
    >
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Create account</h1>
        <p style={{ opacity: 0.75, marginTop: 8 }}>
          Choose your handle + starting role. You can change these later on your
          profile.
        </p>

        <form
          onSubmit={onSubmit}
          style={{ marginTop: 18, display: "grid", gap: 12 }}
        >
          {/* Handle */}
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Handle</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="saybencodes"
              style={{ height: 44, borderRadius: 10, padding: "0 12px" }}
            />
          </label>

          {/* Role */}
          <div style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Starting role</span>

            <div style={{ display: "grid", gap: 8 }}>
              {ROLE_OPTIONS.map((opt) => {
                const selected = role === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderRadius: 12,
                      border: selected
                        ? "1px solid rgba(125,211,252,0.7)"
                        : "1px solid rgba(255,255,255,0.15)",
                      background: selected
                        ? "rgba(41,160,255,0.12)"
                        : "rgba(255,255,255,0.06)",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                      {opt.help}
                    </div>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
              This sets your initial dashboard mode. You can unlock other modes
              later.
            </p>
          </div>

          {/* Email */}
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              style={{ height: 44, borderRadius: 10, padding: "0 12px" }}
            />
          </label>

          {/* Password */}
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              style={{ height: 44, borderRadius: 10, padding: "0 12px" }}
            />
          </label>

          {err ? <p style={{ color: "#ffb4b4" }}>{err}</p> : null}

          <button
            disabled={loading}
            type="submit"
            style={{
              height: 46,
              borderRadius: 12,
              fontWeight: 700,
              background: "#29a0ff",
              color: "#06142e",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p style={{ marginTop: 14, opacity: 0.8 }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
