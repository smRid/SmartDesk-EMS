import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  description?: string;
  icon: LucideIcon;
  title: string;
  value: string | number;
  variant?: "default" | "muted";
};

export function StatCard({
  description,
  icon: Icon,
  title,
  value,
  variant = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-white/80",
        variant === "default" && "bg-gradient-to-br from-white via-white to-teal-50/60",
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-topbar text-white shadow-lg shadow-topbar/20">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
