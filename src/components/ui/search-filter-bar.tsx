import type { FormHTMLAttributes, ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchFilterBarProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
  label?: string;
};

export function SearchFilterBar({ children, className, label = "Search and filters", ...props }: SearchFilterBarProps) {
  return (
    <form aria-label={label} className={cn("panel-card flex flex-col gap-3 border-l-4 border-l-topbar p-4 md:flex-row md:items-center", className)} {...props}>
      <SlidersHorizontal aria-hidden="true" className="hidden size-4 shrink-0 text-topbar md:block" />
      {children}
    </form>
  );
}
