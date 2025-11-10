export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="text-center py-10 text-[var(--ink-700)]">
      <div className="text-lg font-medium mb-1">{title}</div>
      {subtitle && <div className="text-sm mb-3">{subtitle}</div>}
      {action}
    </div>
  );
}
