// lib/hooks/useRealtime.js
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useRealtime(channel, onPayload) {
  useEffect(() => {
    const ch = supabase.channel(channel);
    ch.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      onPayload
    );
    ch.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookings" },
      onPayload
    );
    ch.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      onPayload
    );
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [channel, onPayload]);
}
