import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function CandidateSettings() {
  return (
    <Card title="Settings">
      <EmptyState
        title="Nothing to configure yet"
        subtitle="Profile visibility and notifications will appear here."
      />
    </Card>
  );
}
