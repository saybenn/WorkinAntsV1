// /components/profile/BottomBar.jsx
import Link from "next/link";

export default function BottomBar({ handle, providerExists }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-20 bg-[var(--bg-950)]/90 backdrop-blur border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link
          href={`/u/${handle}?tab=about`}
          className="flex-1 px-4 py-2 rounded-xl border border-[var(--border)] text-center"
        >
          Contact
        </Link>
        {providerExists && (
          <Link
            href={`/u/${handle}?tab=services`}
            className="flex-1 px-4 py-2 rounded-xl bg-[var(--green-500)] text-[var(--bg-950)] text-center font-medium"
          >
            Book
          </Link>
        )}
      </div>
    </div>
  );
}
