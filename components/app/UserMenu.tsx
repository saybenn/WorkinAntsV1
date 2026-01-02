import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          height: 44,
          width: 44,
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.03)",
          color: "var(--ink-900)",
          cursor: "pointer",
        }}
      >
        👤
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: 52,
            width: 220,
            padding: 10,
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "rgba(6,20,46,0.92)",
            boxShadow: "var(--shadow-card)",
            zIndex: 20,
          }}
        >
          <MenuItem label="Profile" onClick={() => alert("TODO: profile")} />
          <MenuItem label="Settings" onClick={() => alert("TODO: settings")} />
          <div
            style={{ height: 1, background: "var(--border)", margin: "8px 0" }}
          />
          <MenuItem
            label="Sign out"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            danger
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 10px",
        borderRadius: 12,
        border: "1px solid transparent",
        background: "transparent",
        color: danger ? "rgba(255,77,79,.92)" : "var(--ink-800)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
