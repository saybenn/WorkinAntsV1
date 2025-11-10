import ThreadList from "@/components/messages/ThreadList";
import ThreadDetail from "@/components/messages/ThreadDetail";
import Composer from "@/components/messages/Composer";
import { useState } from "react";

export default function ClientMessages() {
  const [current, setCurrent] = useState(null);
  return (
    <div className="flex min-h-[520px] border border-[var(--border)] rounded-2xl overflow-hidden">
      <ThreadList scopeLike="order:%" onSelect={setCurrent} current={current} />
      <div className="flex-1 flex flex-col">
        <ThreadDetail threadId={current} />
        {current && <Composer threadId={current} />}
      </div>
    </div>
  );
}
