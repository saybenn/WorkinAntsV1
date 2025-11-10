export default function Card({ title, children, footer, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card-900)] ${className}`}
    >
      {title && (
        <div className="px-4 py-3 border-b border-[var(--border)] font-medium">
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-[var(--border)]">
          {footer}
        </div>
      )}
    </div>
  );
}
