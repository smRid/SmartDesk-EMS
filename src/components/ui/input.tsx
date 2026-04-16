import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-topbar focus-visible:ring-2 focus-visible:ring-topbar/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export { Input };
