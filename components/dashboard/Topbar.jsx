export default function Topbar({ handle, children }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-[color-mix(in_oklab, var(--bg-950), transparent 40%)] border-b border-[var(--border)]">
      <div className="h-14 flex items-center gap-3 px-4">
        <div className="font-medium">@{handle}</div>
        <div className="ml-auto flex items-center gap-3">{children}</div>
      </div>
    </header>
  );
}
