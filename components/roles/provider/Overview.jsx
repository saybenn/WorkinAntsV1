import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import EmptyState from "@/components/ui/EmptyState";

export default function ProviderOverview() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Today's schedule">
        <EmptyState title="No bookings today" />
      </Card>
      <Card title="Inbox">
        <EmptyState title="No unread messages" />
      </Card>
      <Card title="Payouts">
        <div className="text-sm">Pending payouts: $0.00</div>
        <div className="text-xs text-[var(--ink-700)]">Next transfer — TBD</div>
      </Card>
      <Card title="Profile setup">
        <div className="flex items-center gap-4">
          <ProgressRing value={40} />
          <div>
            <div className="font-medium">40% Profile setup</div>
            <ul className="text-sm list-disc ml-5">
              <li>Add a profile picture</li>
              <li>Select service categories</li>
              <li>Create your first service</li>
              <li>Connect to Stripe</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
