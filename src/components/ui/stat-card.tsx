import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  description?: string;
  icon: LucideIcon;
  title: string;
  value: string | number;
  variant?: "default" | "muted" | "success" | "warning" | "danger";
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
        "group relative overflow-hidden border-line before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-topbar",
        variant === "success" && "before:bg-success",
        variant === "warning" && "before:bg-warning",
        variant === "danger" && "before:bg-danger",
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold tabular-nums tracking-[-0.035em] text-slate-950 dark:text-white">
            {value}
          </p>
          {description ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-topbar ring-1 ring-teal-100 transition-transform group-hover:-translate-y-0.5 dark:bg-teal-950/60 dark:ring-teal-900">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
