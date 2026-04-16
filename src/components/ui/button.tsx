import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "md",
      variant: "default",
    },
    variants: {
      size: {
        icon: "h-11 w-11",
        lg: "h-12 px-6",
        md: "h-11 px-5",
        sm: "h-9 px-4",
      },
      variant: {
        default: "bg-topbar text-white hover:bg-[#0f7e77]",
        destructive: "bg-rose-500 text-white hover:bg-rose-600",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
        outline:
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
        success: "bg-emerald-500 text-white hover:bg-emerald-600",
        warning: "bg-amber-400 text-slate-900 hover:bg-amber-500",
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ className, size, variant }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
