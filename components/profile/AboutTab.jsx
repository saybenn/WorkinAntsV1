// /components/profile/AboutTab.jsx
export default function AboutTab({ bio }) {
  return (
    <section className="max-w-3xl mx-auto px-4 py-4">
      <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--card-800)]">
        <h3 className="font-medium text-lg mb-2">About</h3>
        <p className="leading-relaxed text-[var(--ink-700)]">
          {bio || "No bio yet."}
        </p>
      </div>
    </section>
  );
}
