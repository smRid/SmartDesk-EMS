import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/80 motion-reduce:animate-none", className)} {...props} />;
}

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return <div aria-busy="true" aria-label="Loading content" className="panel-card space-y-4 p-6"><LoadingSkeleton className="h-6 w-44" />{Array.from({ length: rows }, (_, index) => <LoadingSkeleton className="h-12 w-full" key={index} />)}</div>;
}
