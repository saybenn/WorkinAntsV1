// /components/profile/Breadcrumbs.jsx
import Link from "next/link";

export default function Breadcrumbs({ handle }) {
  return (
    <div className="sticky top-0 z-20 bg-[var(--bg-950)]/80 backdrop-blur border-b border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-4 py-2 text-sm text-[var(--ink-700)]">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-1">›</span>
        <Link href="/people" className="hover:underline">
          People
        </Link>
        <span className="mx-1">›</span>
        <span className="text-[var(--ink-900)]">@{handle}</span>
      </div>
    </div>
  );
}
