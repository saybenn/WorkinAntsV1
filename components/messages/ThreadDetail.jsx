// components/messages/ThreadDetail.jsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ThreadDetail({ threadId }) {
  const [msgs, setMsgs] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    if (!threadId) return;
    let mounted = true;

    supabase
      .from("messages")
      .select("*")
      .eq("threadid", threadId) // your table uses camel; keep it
      .order("createdat", { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) console.error(error);
        setMsgs(data || []);
        endRef.current?.scrollIntoView({ behavior: "auto" });
      });

    const ch = supabase
      .channel(`msg:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "insert",
          schema: "public",
          table: "messages",
          filter: `threadid=eq.${threadId}`,
        },
        (p) => {
          setMsgs((m) => {
            const next = [...m, p.new];
            queueMicrotask(() =>
              endRef.current?.scrollIntoView({ behavior: "smooth" })
            );
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [threadId]);

  return (
    <div className="flex-1 flex flex-col" id={`panel-inbox`}>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {msgs.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="text-[var(--ink-500)]">
              {new Date(m.createdat).toLocaleString()} —{" "}
            </span>
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
