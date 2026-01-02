import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

async function getProvider() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const resp = await fetch("/api/provider/ensure", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export default function ProviderPayouts() {
  const [prov, setProv] = useState(null);
  useEffect(() => {
    (async () => {
      const p = await getProvider();
      setProv(p);
    })();
  }, []);
  return (
    <Card title="Payouts">
      {!prov ? (
        <EmptyState title="Loading…" />
      ) : prov.stripeReady ? (
        <div className="text-sm space-y-2">
          <div>Stripe account: {prov.stripeAccountId}</div>
          <div>Status: Ready</div>
          <button className="px-3 py-2 rounded-xl border">
            Open Stripe dashboard
          </button>
        </div>
      ) : (
        <EmptyState
          title="Connect Stripe"
          subtitle="Receive payouts securely to your bank."
          action={
            <button className="px-3 py-2 rounded-xl bg-[var(--blue-600)]">
              Start onboarding
            </button>
          }
        />
      )}
    </Card>
  );
}
