import { useMemo, useState } from "react";

export default function PostJobPanel({ taxonomy }: { taxonomy: any }) {
  const domains = taxonomy?.domains ?? [];
  const categoriesByDomain = taxonomy?.categoriesByDomain ?? {};
  const tagsByCategory = taxonomy?.tagsByCategory ?? {};

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [budget, setBudget] = useState("100-300");

  const categories = useMemo(
    () => (domain ? categoriesByDomain[domain] ?? [] : []),
    [domain, categoriesByDomain]
  );
  const tagOpts = useMemo(
    () => (category ? tagsByCategory[category] ?? [] : []),
    [category, tagsByCategory]
  );

  const canSubmit =
    title.trim().length >= 6 && description.trim().length >= 20 && category;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 18 }}>Post a Job</div>
      <div style={{ color: "var(--ink-700)", marginTop: 6 }}>
        This creates a job request that professionals can respond to.
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={input}
            placeholder="e.g. Build a landing page for my business"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...input, height: 120, paddingTop: 10 }}
            placeholder="Explain what you need, timeline, and any constraints."
          />
        </Field>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <Field label="Domain (L1)">
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setCategory("");
                setTags([]);
              }}
              style={input}
            >
              <option value="">Select domain</option>
              {domains.map((d: any) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category (L2)">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setTags([]);
              }}
              style={input}
              disabled={!domain}
            >
              <option value="">
                {domain ? "Select category" : "Select domain first"}
              </option>
              {categories.map((c: any) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tags (L3)">
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              opacity: category ? 1 : 0.6,
            }}
          >
            {!category ? (
              <span style={{ color: "var(--ink-700)" }}>
                Select a category first.
              </span>
            ) : (
              tagOpts.slice(0, 14).map((t: any) => {
                const active = tags.includes(t.slug);
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() =>
                      setTags(
                        active
                          ? tags.filter((x) => x !== t.slug)
                          : [...tags, t.slug].slice(0, 8)
                      )
                    }
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      border: `1px solid ${
                        active ? "rgba(125,211,252,0.35)" : "var(--border)"
                      }`,
                      background: active
                        ? "rgba(125,211,252,0.10)"
                        : "rgba(255,255,255,0.03)",
                      color: active ? "var(--ink-900)" : "var(--ink-700)",
                      cursor: "pointer",
                    }}
                  >
                    {t.name}
                  </button>
                );
              })
            )}
          </div>
        </Field>

        <Field label="Budget">
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={input}
          >
            <option value="50-100">$50–$100</option>
            <option value="100-300">$100–$300</option>
            <option value="300-1000">$300–$1,000</option>
            <option value="1000+">$1,000+</option>
          </select>
        </Field>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => alert("TODO: create job post")}
          style={{
            height: 44,
            borderRadius: 12,
            border: "1px solid rgba(125,211,252,0.22)",
            background: canSubmit
              ? "rgba(41,160,255,0.12)"
              : "rgba(255,255,255,0.03)",
            color: canSubmit ? "var(--ink-900)" : "var(--muted-400)",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          Create Job
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "var(--ink-700)", fontSize: 13 }}>{label}</span>
      {children}
    </label>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--ink-900)",
  outline: "none",
};
