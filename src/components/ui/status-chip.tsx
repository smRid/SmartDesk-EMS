import { Badge } from "@/components/ui/badge";
import { statusTone } from "@/lib/utils";

export function StatusChip({ label }: { label: string }) {
  return <Badge variant={statusTone(label)}>{label}</Badge>;
}
