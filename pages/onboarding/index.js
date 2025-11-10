// /pages/onboarding/index.js
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

const DRAFT_KEY = "onboarding_state_v1";

const ROLES = [
  {
    key: "provider",
    label: "I’m a Provider",
    desc: "Offer services and get booked.",
  },
  {
    key: "candidate",
    label: "I’m a Candidate",
    desc: "Find jobs and get hired.",
  },
  {
    key: "organization",
    label: "I’m an Organization",
    desc: "Hire people and manage roles.",
  },
  { key: "client", label: "I’m a Client", desc: "Book providers for work." },
];

export default function Onboarding() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // flow state
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  // ---------- Boot: redirect if signed-in & has handle ----------
  useEffect(() => {
    let mounted = true;
    const veilTimeout = setTimeout(
      () => mounted && setCheckingProfile(false),
      4000
    );

    async function boot() {
      try {
        const {
          data: { session: s },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(s || null);

        if (s) {
          // Use v_profiles in app schema
          const { data: prof, error } = await supabase
            .schema("app")
            .from("v_profiles")
            .select("handle")
            .eq("id", s.user.id)
            .maybeSingle();

          if (error)
            console.warn(
              "[onboarding] v_profiles lookup failed:",
              error.message
            );

          if (prof?.handle) {
            router.replace(`/u/${prof.handle}`);
            return;
          } else {
            setCheckingProfile(false);
          }
        } else {
          setCheckingProfile(false);
        }
      } catch (e) {
        console.warn("[onboarding] boot error:", e);
        setCheckingProfile(false);
      } finally {
        clearTimeout(veilTimeout);
      }
    }

    boot();

    // react to auth changes (magic link)
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_evt, newS) => {
        setSession(newS || null);
        if (newS) {
          try {
            const { data: prof } = await supabase
              .schema("app")
              .from("v_profiles")
              .select("handle")
              .eq("id", newS.user.id)
              .maybeSingle();
            if (prof?.handle) {
              router.replace(`/u/${prof.handle}`);
            } else {
              setCheckingProfile(false);
              setStep((s) => (s === 2 ? 3 : s)); // skip email if we just signed in
            }
          } catch {
            setCheckingProfile(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
      clearTimeout(veilTimeout);
    };
  }, [router]);

  // ---------- Load/persist local draft ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        const pre = sessionStorage.getItem("intent");
        if (pre) setIntent(pre);
        return;
      }
      const d = JSON.parse(raw);
      if (d.intent) setIntent(d.intent);
      if (d.handle) setHandle(d.handle);
      if (d.email) setEmail(d.email);
      if (d.avatarUrl) setAvatarUrl(d.avatarUrl);
      if (typeof d.step === "number") setStep(d.step);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ step, intent, handle, email, avatarUrl })
      );
    } catch {}
  }, [step, intent, handle, email, avatarUrl]);

  // ---------- Handle availability (public RPC in app schema) ----------
  useEffect(() => {
    if (!handle || handle.length < 3) {
      setAvailability(null);
      return;
    }
    const t = setTimeout(async () => {
      setChecking(true);
      const { data, error } = await supabase
        .schema("app")
        .rpc("check_handle_available", { h: handle });
      setAvailability(error ? null : !!data);
      setChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [handle]);

  // Skip Email step if already signed in
  const safeStep = session && step === 2 ? 3 : step;

  function next() {
    setMsg("");
    if (safeStep === 0 && !intent) return setMsg("Choose one.");
    if (safeStep === 1) {
      const ok = /^[A-Za-z0-9_]{3,20}$/.test(handle || "");
      if (!ok) return setMsg("Use 3–20 letters, numbers, or underscores.");
      if (availability === false) return setMsg("That handle is taken.");
    }
    if (safeStep === 2 && !session && !email) return setMsg("Enter an email.");
    setStep((s) => Math.min(s + 1, 4));
  }
  function back() {
    setMsg("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function chooseRole(roleKey) {
    setIntent(roleKey);
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const d = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ ...d, intent: roleKey, step: 1 })
      );
    } catch {}
    setStep(1);
  }

  async function sendMagicLink() {
    setMsg("");
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setSending(false);
    if (error) setMsg(error.message);
    else
      setMsg("✅ Check your email for the magic link and return to continue.");
  }

  async function onAvatarChange(e) {
    setMsg("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!session) return setMsg("Please sign in first (use the magic link).");
    const key = `${session.user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(key, file, { upsert: true, cacheControl: "3600" });
    if (upErr) return setMsg(upErr.message);
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(key);
    setAvatarUrl(publicUrl);
    setMsg("✅ Photo added (optional).");
  }

  async function submitEnvelope() {
    setMsg("");
    if (!session) return setMsg("Please complete email sign-in first.");
    setSubmitting(true);
    try {
      const {
        data: { session: fresh },
      } = await supabase.auth.getSession();
      const token = fresh?.access_token;

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ intent, handle, avatarUrl }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setMsg(j.error || "Something went wrong.");
        return;
      }

      const { data: prof } = await supabase
        .schema("app")
        .from("v_profiles")
        .select("handle")
        .eq("id", session.user.id)
        .single();

      localStorage.removeItem(DRAFT_KEY);
      window.location.href = `/u/${
        prof?.handle ?? handle.toLowerCase()
      }?first=true`;
    } finally {
      setSubmitting(false);
    }
  }

  const progressPct = useMemo(() => ((safeStep + 1) / 5) * 100, [safeStep]);

  if (checkingProfile) {
    return (
      <main className="min-h-screen grid place-items-center bg-(--bg-950) text-(--ink-900)">
        <div className="text-sm opacity-80">Loading…</div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Onboarding • Wellvix</title>
      </Head>

      <main className="min-h-screen bg-(--bg-950) text-(--ink-900)">
        <div className="mx-auto max-w-2xl px-4 py-10">
          {/* progress */}
          <div className="mb-6">
            <div className="h-2 rounded bg-white/10">
              <div
                className="h-2 rounded bg-(--green-500) transition-[width]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-(--ink-700)">
              Step {safeStep + 1} of 5
            </p>
          </div>

          {/* Step 1: role */}
          {safeStep === 0 && (
            <section>
              <h1 className="text-2xl font-semibold">Welcome — who are you?</h1>
              <p className="mt-1 text-(--ink-700)">
                Pick your lane. You can change later.
              </p>

              <div className="mt-6 grid gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => chooseRole(r.key)}
                    className={`rounded-(--r-sm) border border-(--border) bg-(--card-800) px-4 py-3 text-left hover:bg-white/5 ${
                      intent === r.key
                        ? "outline outline-2 outline-(--green-500)"
                        : ""
                    }`}
                  >
                    <div className="font-medium">{r.label}</div>
                    <div className="text-(--ink-700) text-sm">{r.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-red-400 text-sm">{msg}</span>
                <button
                  onClick={next}
                  className="rounded-(--r-sm) bg-(--green-500) px-4 py-2 text-(--bg-950)"
                >
                  Continue
                </button>
              </div>
            </section>
          )}

          {/* Step 2: handle */}
          {safeStep === 1 && (
            <section>
              <h1 className="text-2xl font-semibold">Choose your handle</h1>
              <p className="mt-1 text-(--ink-700)">
                Letters, numbers, or underscores. 3–20 chars.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-(--r-sm) bg-(--bg-900) border border-(--border) px-2 py-2 text-(--ink-700)">
                  @
                </span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="flex-1 rounded-(--r-sm) bg-(--bg-900) border border-(--border) px-3 py-2"
                  placeholder="yourname"
                  minLength={3}
                  maxLength={20}
                  pattern="^[A-Za-z0-9_]+$"
                />
              </div>
              <div className="mt-2 text-sm">
                {checking
                  ? "Checking…"
                  : availability === true
                  ? "✅ Available"
                  : availability === false
                  ? "❌ Taken"
                  : ""}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={back}
                  className="rounded-(--r-sm) bg-white/10 px-4 py-2"
                >
                  Back
                </button>
                <div className="flex items-center gap-3">
                  {availability === false && (
                    <button
                      type="button"
                      onClick={() =>
                        setHandle(
                          (prev) => `${prev}${Math.floor(Math.random() * 100)}`
                        )
                      }
                      className="rounded-(--r-sm) bg-white/10 px-3 py-2 text-sm"
                    >
                      Suggest
                    </button>
                  )}
                  <button
                    onClick={next}
                    className="rounded-(--r-sm) bg-(--green-500) px-4 py-2 text-(--bg-950)"
                  >
                    Continue
                  </button>
                </div>
              </div>
              <span className="mt-2 block text-red-400 text-sm">{msg}</span>
            </section>
          )}

          {/* Step 3: email (hidden if already signed in) */}
          {safeStep === 2 && !session && (
            <section>
              <h1 className="text-2xl font-semibold">Add your email to join</h1>
              <p className="mt-1 text-(--ink-700)">
                We’ll send you a magic link. No passwords.
              </p>
              <div className="mt-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-(--r-sm) bg-(--bg-900) border border-(--border) px-3 py-2"
                />
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={back}
                  className="rounded-(--r-sm) bg-white/10 px-4 py-2"
                >
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={sendMagicLink}
                    disabled={sending}
                    className="rounded-(--r-sm) bg-white/10 px-3 py-2 text-sm"
                  >
                    {sending ? "Sending…" : "Send magic link"}
                  </button>
                  <button
                    onClick={next}
                    className="rounded-(--r-sm) bg-(--green-500) px-4 py-2 text-(--bg-950)"
                  >
                    I’ve opened the link
                  </button>
                </div>
              </div>
              <span className="mt-2 block text-red-400 text-sm">{msg}</span>
            </section>
          )}

          {/* Step 4: avatar */}
          {safeStep === 3 && (
            <section>
              <h1 className="text-2xl font-semibold">
                Add your photo (optional)
              </h1>
              <p className="mt-1 text-(--ink-700)">
                You can skip this and add it later.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-20 w-20 rounded-full border border-(--border) overflow-hidden bg-(--bg-900)">
                  {avatarUrl ? (
                    <img
                      alt="avatar"
                      src={avatarUrl}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-(--ink-700)">
                      ?
                    </div>
                  )}
                </div>
                <label className="text-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onAvatarChange}
                  />
                </label>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={back}
                  className="rounded-(--r-sm) bg-white/10 px-4 py-2"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  className="rounded-(--r-sm) bg-(--green-500) px-4 py-2 text-(--bg-950)"
                >
                  Continue
                </button>
              </div>
              <span className="mt-2 block text-red-400 text-sm">{msg}</span>
            </section>
          )}

          {/* Step 5: review */}
          {safeStep === 4 && (
            <section>
              <h1 className="text-2xl font-semibold">Ready to begin?</h1>
              <p className="mt-1 text-(--ink-700)">
                We’ll create your page and get you set up.
              </p>
              <div className="mt-4 rounded-(--r-md) border border-(--border) bg-(--card-800) p-4 text-sm">
                <div>
                  Intent: <strong>{intent || "—"}</strong>
                </div>
                <div>
                  Handle: <strong>@{handle || "—"}</strong>
                </div>
                <div>
                  Avatar: <strong>{avatarUrl ? "✅" : "—"}</strong>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={back}
                  className="rounded-(--r-sm) bg-white/10 px-4 py-2"
                >
                  Back
                </button>
                <button
                  onClick={submitEnvelope}
                  disabled={submitting}
                  className="rounded-(--r-sm) bg-(--green-500) px-4 py-2 text-(--bg-950)"
                >
                  {submitting ? "Starting…" : "Start Journey"}
                </button>
              </div>
              <span className="mt-2 block text-red-400 text-sm">{msg}</span>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
