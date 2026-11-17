import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DataTableShellProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  footer?: ReactNode;
  title?: string;
  tools?: ReactNode;
};

export function DataTableShell({ children, className, description, footer, title, tools }: DataTableShellProps) {
  return (
    <section aria-label={title ?? "Data table"} className={cn("space-y-3", className)}>
      {title || description || tools ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title ? <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {tools}
        </div>
      ) : null}
      {children}
      {footer ? <div className="text-sm text-muted">{footer}</div> : null}
    </section>
  );
}
