import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    defaultVariants: {
      variant: "secondary",
    },
    variants: {
      variant: {
        destructive: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200",
        secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        success:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
      },
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ className, variant }))} {...props} />;
}

export { Badge, badgeVariants };
