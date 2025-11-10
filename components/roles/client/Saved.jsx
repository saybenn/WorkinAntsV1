import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function ClientSaved() {
  return (
    <Card title="Saved">
      <EmptyState
        title="No favorites yet"
        subtitle="Tap the heart on providers and services to save them."
      />
    </Card>
  );
}
