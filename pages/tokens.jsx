// pages/design/tokens.jsx
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";

/** Ops: hide in production + noindex */
export async function getServerSideProps({ res }) {
  if (process.env.NODE_ENV === "production") return { notFound: true };
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return { props: {} };
}

/* ----------
   Tiny helpers (UI-only, variable-driven)
---------- */
function Code({ children }) {
  return (
    <pre
      className="mt-3 text-xs rounded-[var(--r-md)] border border-[var(--border)] overflow-x-auto"
      style={{ background: "var(--bg-ivory)", color: "var(--ink-900)" }}
    >
      <code>{children}</code>
    </pre>
  );
}

function Swatch({ label, cls, note }) {
  return (
    <div
      className="rounded-[var(--r-md)] border border-[var(--border)] p-3"
      style={{
        background: "color-mix(in oklab, var(--ink-900) 4%, transparent)",
      }}
    >
      <div className={`h-16 rounded-[var(--r-sm)] ${cls}`} />
      <div className="mt-2 text-sm" style={{ color: "var(--ink-700)" }}>
        {label}
      </div>
      {note ? <div className="caption">{note}</div> : null}
      <Code>{cls}</Code>
    </div>
  );
}

function Divider() {
  return <hr className="my-10 border-[var(--border)]" />;
}

function VarValue({ name }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    setValue(v || "—");
  }, [name]);
  return (
    <span
      className="inline-flex items-center gap-2 text-xs"
      style={{ color: "var(--ink-700)" }}
    >
      <span className="eyebrow">computed:</span>
      <span className="font-mono">{value}</span>
    </span>
  );
}

/* ----------
   Page
---------- */
export default function TokensPage() {
  // Alias a few optional tokens your components.css references but didn’t define
  // (no hex here; all aliases resolve to existing vars or raw lengths).
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--white", "var(--ink-900)");
    root.style.setProperty("--bg-cream", "var(--bg-ivory)");
    root.style.setProperty("--shadow-card", "var(--shadow-soft)");
    root.style.setProperty("--space-16", "4rem");
    root.style.setProperty("--dur-2", "160ms");
    root.style.setProperty("--dur-3", "260ms");
    root.style.setProperty("--ease-out", "cubic-bezier(.17,.67,.26,1)");
    // optional fallbacks for fonts
    root.style.setProperty(
      "--font-head",
      "ui-sans-serif, system-ui, Inter, sans-serif"
    );
    root.style.setProperty(
      "--font-body",
      "ui-sans-serif, system-ui, Inter, sans-serif"
    );
  }, []);

  const groups = useMemo(
    () => [
      {
        title: "Surfaces",
        items: [
          { label: "--bg-950", cls: "bg-[var(--bg-950)]" },
          { label: "--bg-900", cls: "bg-[var(--bg-900)]" },
          { label: "--bg-ivory", cls: "bg-[var(--bg-ivory)]" },
          { label: "--card-900", cls: "bg-[var(--card-900)]" },
          { label: "--card-800", cls: "bg-[var(--card-800)]" },
          { label: "--overlay-700", cls: "bg-[var(--overlay-700)]" },
          {
            label: "--border (as border)",
            cls: "bg-[var(--bg-ivory)] border-2 border-[var(--border)]",
          },
          {
            label: "--border-strong (as border)",
            cls: "bg-[var(--bg-ivory)] border-2 border-[var(--border-strong)]",
          },
        ],
      },
      {
        title: "Ink",
        items: [
          {
            label: "--ink-900",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
            note: "primary on-dark",
          },
          {
            label: "--ink-700",
            cls: "bg-white text-[var(--ink-700)] p-4 rounded-[var(--r-sm)]",
            note: "secondary on-dark",
          },
          {
            label: "--ink-500",
            cls: "bg-white text-[var(--ink-500)] p-4 rounded-[var(--r-sm)]",
            note: "tertiary on-dark",
          },
          {
            label: "--muted-400",
            cls: "bg-white text-[var(--muted-400)] p-4 rounded-[var(--r-sm)]",
            note: "muted on-dark",
          },
        ],
      },
      {
        title: "Brand",
        items: [
          { label: "--blue-800", cls: "bg-[var(--blue-800)]" },
          { label: "--blue-600", cls: "bg-[var(--blue-600)]" },
          { label: "--blue-500", cls: "bg-[var(--blue-500)]" },
          { label: "--aqua-300", cls: "bg-[var(--aqua-300)]" },
          { label: "--green-500", cls: "bg-[var(--green-500)]" },
        ],
      },
      {
        title: "Radii",
        items: [
          {
            label: "--r-xs",
            cls: "bg-[var(--blue-500)] h-12 rounded-[var(--r-xs)]",
          },
          {
            label: "--r-sm",
            cls: "bg-[var(--blue-500)] h-12 rounded-[var(--r-sm)]",
          },
          {
            label: "--r-md",
            cls: "bg-[var(--blue-500)] h-12 rounded-[var(--r-md)]",
          },
          {
            label: "--r-lg",
            cls: "bg-[var(--blue-500)] h-12 rounded-[var(--r-lg)]",
          },
          {
            label: "--r-pill",
            cls: "bg-[var(--blue-500)] h-12 rounded-[var(--r-pill)]",
          },
        ],
      },
      {
        title: "Type Scale",
        items: [
          {
            label: "--size-xs",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
          },
          {
            label: "--size-sm",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
          },
          {
            label: "--size-base",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
          },
          {
            label: "--size-lg",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
          },
          {
            label: "--size-xl",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
          },
          {
            label: "--size-2xl",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
          },
          {
            label: "--size-3xl",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
          },
          {
            label: "--size-4xl",
            cls: "bg-white text-[var(--ink-900)] p-4 rounded-[var(--r-sm)]",
          },
        ],
      },
      {
        title: "Glass & Gradients",
        items: [
          { label: "--glass-bg", cls: "bg-[var(--glass-bg)]" },
          {
            label: "--glass-ring as border",
            cls: "bg-[var(--bg-ivory)] border-2 border-[var(--glass-ring)]",
          },
          {
            label: "--glass-shadow (see demos)",
            cls: "bg-[var(--bg-ivory)] h-12 rounded-[var(--r-md)]",
          },
        ],
      },
    ],
    []
  );

  const navRef = useRef(null);
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    if (!navRef.current) return;
    navRef.current.classList.toggle("nav-is-solid", navSolid);
  }, [navSolid]);

  return (
    <>
      <Head>
        <title>Design Tokens • WorkinAnts</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {/* Optional: demo aliases for missing CSS custom properties */}
      <style>{`:root{--white:var(--ink-900);--bg-cream:var(--bg-ivory);--shadow-card:var(--shadow-soft);--space-16:4rem;--dur-2:160ms;--dur-3:260ms;--ease-out:cubic-bezier(.17,.67,.26,1);--font-head:ui-sans-serif,system-ui,Inter,sans-serif;--font-body:ui-sans-serif,system-ui,Inter,sans-serif}`}</style>

      <main
        className="min-h-screen"
        style={{ background: "var(--bg-950)", color: "var(--ink-900)" }}
      >
        {/* Sticky fake nav to test .nav-is-solid */}
        <div
          ref={navRef}
          className="sticky top-0 z-20 w-full border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="font-bold tracking-tight">
              WorkinAnts • Token Lab
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setNavSolid((v) => !v)}
            >
              Toggle Nav Solid
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-6">
            <div className="eyebrow">Internal</div>
            <h1 className="h1">Design Tokens Playground</h1>
            <p className="subhead mt-2">
              Visual QA for colors, type, radii, buttons, glass, gradients,
              animation, and layout helpers. Change values in{" "}
              <code>styles/tokens.css</code> and the whole page updates.
            </p>
            <Code>{`/* no hex here — components read vars only */
<div className="rounded-[var(--r-md)] border border-[var(--border)]"
     style={{ background: "var(--card-800)", color:"var(--ink-900)" }}>...</div>`}</Code>
          </div>

          {/* SWATCH GROUPS */}
          {groups.map((g) => (
            <section key={g.title} className="mt-8">
              <h2 className="h2">{g.title}</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {g.items.map((item) => (
                  <div key={item.label}>
                    <Swatch {...item} />
                    <div className="mt-2">
                      <VarValue name={item.label.split(" ")[0]} />
                    </div>
                  </div>
                ))}
              </div>
              <Divider />
            </section>
          ))}

          {/* BUTTONS SHOWCASE — uses your .btn classes */}
          <section>
            <h2 className="h2">Buttons (components.css)</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-success">Success</button>
              <button className="btn btn-ghost border border-[var(--border)]">
                Ghost
              </button>
            </div>
            <Code>{`.btn.btn-primary { background: var(--blue-600); } /* hover -> var(--blue-500) */`}</Code>
            <Divider />
          </section>

          {/* HERO / GLASS DEMO */}
          <section>
            <h2 className="h2">Hero Glass Card</h2>
            <div className="mt-4 relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border-strong)]">
              <div
                className="hero-21x9 w-full bg-center bg-cover"
                style={{ backgroundImage: "url('/brand/hero-tiles.jpg')" }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "var(--grad-hero)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="glass rounded-[var(--r-lg)] px-6 py-8 max-w-3xl w-full">
                  <h3
                    className="text-center"
                    style={{
                      fontSize: "var(--size-4xl)",
                      lineHeight: "var(--leading-tight)",
                    }}
                  >
                    Any Service. Anytime. Anywhere.
                  </h3>
                  <p
                    className="text-center mt-2"
                    style={{ color: "var(--ink-700)" }}
                  >
                    Global • Unlimited • Affordable • Quality
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
                    <button className="btn btn-primary rounded-[var(--r-pill)]">
                      Digital Services
                    </button>
                    <button className="btn btn-ghost rounded-[var(--r-pill)] border border-[var(--border)]">
                      In-person Services
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <Divider />
          </section>

          {/* PROCESS CARDS */}
          <section>
            <h2 className="h2">Dark Cards / Elevation</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "Create Account",
                "Choose your Pro",
                "Team Work",
                "Approve & Pay",
              ].map((t, i) => (
                <div
                  key={t}
                  className="rounded-[var(--r-lg)] p-5"
                  style={{
                    background: "var(--card-800)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-soft)",
                  }}
                >
                  <div className="eyebrow">0{i + 1}.</div>
                  <div
                    className="mt-1"
                    style={{ fontSize: "var(--size-xl)", fontWeight: 700 }}
                  >
                    {t}
                  </div>
                  <p className="mt-2" style={{ color: "var(--ink-700)" }}>
                    On-dark readability & spacing rhythm check.
                  </p>
                </div>
              ))}
            </div>
            <Divider />
          </section>

          {/* TILE RAIL */}
          <section>
            <h2 className="h2">Tile Rail (overlay & border)</h2>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {["tile-1.jpg", "tile-2.jpg", "tile-3.jpg", "tile-4.jpg"].map(
                (f) => (
                  <div
                    key={f}
                    className="min-w-[280px] h-[160px] rounded-[var(--r-lg)] overflow-hidden border relative"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div
                      className="absolute inset-0 bg-center bg-cover"
                      style={{ backgroundImage: `url('/brand/${f}')` }}
                    />
                    <div className="absolute inset-0 bg-[var(--overlay-700)]" />
                    <div className="absolute left-4 bottom-3 font-semibold">
                      Category
                    </div>
                  </div>
                )
              )}
            </div>
            <Divider />
          </section>

          {/* ASPECT HELPERS */}
          <section>
            <h2 className="h2">Aspect Helpers</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { cls: "hero-16x9", label: "16:9" },
                { cls: "hero-21x9", label: "21:9" },
                { cls: "hero-4x3", label: "4:3" },
              ].map(({ cls, label }) => (
                <div
                  key={cls}
                  className={`${cls} rounded-[var(--r-md)] border flex items-center justify-center`}
                  style={{
                    background: "var(--card-900)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span className="eyebrow">{label}</span>
                </div>
              ))}
            </div>
            <Divider />
          </section>

          {/* ANIMATION DEMO */}
          <section>
            <h2 className="h2">Animation (fadeUp)</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="card animate-fadeUp p-4"
                  style={{
                    background: "var(--card-800)",
                    border: "1px solid var(--border)",
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div
                    className="h-16 rounded-[var(--r-sm)]"
                    style={{
                      background:
                        "color-mix(in oklab, var(--blue-500) 35%, transparent)",
                    }}
                  />
                  <p className="caption mt-2">delay {i * 60}ms</p>
                </div>
              ))}
            </div>
            <Divider />
          </section>

          {/* GRADIENTS */}
          <section>
            <h2 className="h2">Gradients</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="h-32 rounded-[var(--r-md)] border"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--grad-hero)",
                }}
              />
              <div
                className="h-32 rounded-[var(--r-md)] border"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--grad-rail)",
                }}
              />
            </div>
            <Divider />
          </section>

          {/* TYPOGRAPHY SCALE SAMPLE */}
          <section>
            <h2 className="h2">Typography Scale</h2>
            <div className="mt-4 space-y-2">
              <div className="h1">Heading 1</div>
              <div className="h2">Heading 2</div>
              <div className="subhead">Subhead paragraph — secondary tone.</div>
              <div className="caption">Caption / helper text.</div>
            </div>
            <Divider />
          </section>

          {/* VARIABLE INSPECTOR */}
          <section>
            <h2 className="h2">Variable Inspector</h2>
            <p className="subhead mt-1">
              Computed values pulled from <code>:root</code>.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "--bg-950",
                "--bg-900",
                "--bg-ivory",
                "--card-900",
                "--card-800",
                "--overlay-700",
                "--ink-900",
                "--ink-700",
                "--ink-500",
                "--muted-400",
                "--blue-800",
                "--blue-600",
                "--blue-500",
                "--aqua-300",
                "--green-500",
                "--border",
                "--border-strong",
                "--shadow-soft",
                "--r-xs",
                "--r-sm",
                "--r-md",
                "--r-lg",
                "--r-pill",
                "--glass-bg",
                "--glass-ring",
                "--glass-shadow",
                "--size-xs",
                "--size-sm",
                "--size-base",
                "--size-lg",
                "--size-xl",
                "--size-2xl",
                "--size-3xl",
                "--size-4xl",
                "--leading-normal",
                "--leading-tight",
                "--grad-hero",
                "--grad-rail",
              ].map((name) => (
                <div
                  key={name}
                  className="rounded-[var(--r-sm)] p-3 border"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--card-800)",
                  }}
                >
                  <div className="font-semibold">{name}</div>
                  <VarValue name={name} />
                </div>
              ))}
            </div>
          </section>

          <Divider />
          <p className="text-center caption">
            WorkinAnts • Token Lab • Truth Mode
          </p>
        </div>
      </main>
    </>
  );
}
