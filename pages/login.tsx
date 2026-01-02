import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { supabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "magic_link" | "password";

export default function LoginPage() {
  const router = useRouter();
  const next = useMemo(() => {
    const n = router.query.next;
    return typeof n === "string" && n.startsWith("/") ? n : "/";
  }, [router.query.next]);

  const supabase = useMemo(() => supabaseBrowserClient(), []);

  const [mode, setMode] = useState<Mode>("magic_link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setStatus("loading");

    try {
      if (!email.trim()) throw new Error("Email is required.");

      if (mode === "magic_link") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${
              window.location.origin
            }/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        setStatus("sent");
        return;
      }

      // password mode
      if (!password) throw new Error("Password is required.");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // At this point the browser session exists; for SSR pages, callback route also works.
      router.replace(next);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message ?? "Login failed.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--grad-app)",
        color: "var(--ink-900)",
      }}
    >
      <div
        style={{
          width: "min(420px, 100%)",
          background: "var(--glass-bg-strong)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-card)",
          padding: 20,
          backdropFilter: "blur(var(--glass-blur))",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.2 }}>Sign in</h1>
        <p style={{ marginTop: 8, color: "var(--ink-700)" }}>
          Continue to your dashboard.
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setMode("magic_link")}
            style={pill(mode === "magic_link")}
          >
            Magic link
          </button>
          <button
            type="button"
            onClick={() => setMode("password")}
            style={pill(mode === "password")}
          >
            Password
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          style={{ marginTop: 14, display: "grid", gap: 10 }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "var(--ink-700)", fontSize: 13 }}>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@domain.com"
              style={inputStyle}
              required
            />
          </label>

          {mode === "password" && (
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--ink-700)", fontSize: 13 }}>
                Password
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                style={inputStyle}
                required
              />
            </label>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            style={primaryBtn}
          >
            {status === "loading"
              ? "Working…"
              : mode === "magic_link"
              ? "Send magic link"
              : "Sign in"}
          </button>

          {status === "sent" && (
            <div style={notice}>Check your email for the sign-in link.</div>
          )}

          {errorMsg && (
            <div style={{ ...notice, borderColor: "rgba(255,77,79,.35)" }}>
              {errorMsg}
            </div>
          )}

          <p
            style={{
              margin: "8px 0 0",
              color: "var(--muted-400)",
              fontSize: 12,
            }}
          >
            Redirect after login:{" "}
            <span style={{ color: "var(--ink-700)" }}>{next}</span>
          </p>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--ink-900)",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(125,211,252,0.22)",
  background:
    "linear-gradient(180deg, rgba(41,160,255,.22), rgba(41,160,255,.12))",
  color: "var(--ink-900)",
  cursor: "pointer",
};

const notice: React.CSSProperties = {
  marginTop: 6,
  padding: 10,
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "rgba(0,0,0,0.18)",
  color: "var(--ink-800)",
};

function pill(active: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${active ? "rgba(41,160,255,0.5)" : "var(--border)"}`,
    background: active ? "rgba(41,160,255,0.12)" : "rgba(255,255,255,0.03)",
    color: active ? "var(--ink-900)" : "var(--ink-700)",
    cursor: "pointer",
  };
}
