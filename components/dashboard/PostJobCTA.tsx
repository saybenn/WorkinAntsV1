export default function PostJobCTA({ onClick }: { onClick: () => void }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: 900 }}>Need something specific?</div>
        <div style={{ color: "var(--ink-700)", marginTop: 4 }}>
          Post a job and let professionals reach out with offers.
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        style={{
          height: 44,
          padding: "0 14px",
          borderRadius: 12,
          border: "1px solid rgba(125,211,252,0.22)",
          background: "rgba(41,160,255,0.12)",
          color: "var(--ink-900)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Post a Job
      </button>
    </div>
  );
}
