// components/messages/ThreadList.jsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ThreadList({
  scopeLike = "order:%",
  onSelect,
  current,
}) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    let mounted = true;
    supabase
      .from("v_message_threads")
      .select("*")
      .like("thread_id", scopeLike)
      .order("last_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) console.error(error);
        setRows(data || []);
      });
    return () => {
      mounted = false;
    };
  }, [scopeLike]);

  return (
    <aside
      className="w-72 border-r border-[var(--border)]"
      aria-label="Threads"
    >
      {rows.map((r) => (
        <button
          key={r.thread_id}
          onClick={() => onSelect(r.thread_id)}
          className={`block w-full text-left px-3 py-3 border-b border-[var(--border)] ${
            current === r.thread_id ? "bg-[var(--card-800)]" : ""
          }`}
        >
          <div className="font-medium truncate">{r.thread_id}</div>
          <div className="text-xs text-[var(--ink-500)] truncate">
            {r.last_message}
          </div>
        </button>
      ))}
      {!rows.length && (
        <div className="p-4 text-sm text-[var(--ink-700)]">
          No conversations yet.
        </div>
      )}
    </aside>
  );
}
