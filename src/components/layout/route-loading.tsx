import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export function RouteLoading({ label = "Loading page" }: { label?: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="space-y-6">
      <div className="space-y-3 border-b border-line pb-5">
        <LoadingSkeleton className="h-3 w-24" />
        <LoadingSkeleton className="h-9 w-72 max-w-full" />
        <LoadingSkeleton className="h-4 w-[34rem] max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="panel-card space-y-4 p-5" key={index}>
            <LoadingSkeleton className="h-4 w-28" />
            <LoadingSkeleton className="h-8 w-20" />
            <LoadingSkeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="panel-card space-y-4 p-5">
        <LoadingSkeleton className="h-11 w-full" />
        {Array.from({ length: 5 }, (_, index) => (
          <LoadingSkeleton className="h-12 w-full" key={index} />
        ))}
      </div>
    </div>
  );
}
