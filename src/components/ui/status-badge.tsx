import { Badge } from "@/components/ui/badge";
import { statusTone } from "@/lib/utils";

export function StatusBadge({ label, showDot = true }: { label: string; showDot?: boolean }) {
  return <Badge className="gap-1.5 capitalize" variant={statusTone(label)}>{showDot ? <span aria-hidden="true" className="size-1.5 rounded-full bg-current" /> : null}{label}</Badge>;
}
