import { StatusBadge } from "@/components/ui/status-badge";

export function StatusChip({ label }: { label: string }) {
  return <StatusBadge label={label} />;
}
