// components/messages/Composer.jsx
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function Composer({ threadId }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const content = text.trim();
    if (!content) return;
    setBusy(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) throw new Error("Not signed in.");
      const { error } = await supabase
        .from("messages")
        .insert({ threadid: threadId, fromid: uid, content });
      if (error) throw error;
      setText("");
    } catch (e) {
      console.error(e);
      // TODO: toast error
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-[var(--border)] p-3 flex gap-2">
      <input
        className="flex-1 bg-[var(--bg-900)] rounded-xl px-3 py-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message (max ~4000 chars)…"
        maxLength={4000}
      />
      <button
        onClick={send}
        disabled={busy || !text.trim()}
        className="px-3 py-2 rounded-xl bg-[var(--blue-600)] disabled:opacity-60"
      >
        Send
      </button>
    </div>
  );
}
