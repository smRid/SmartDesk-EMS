import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" className="space-y-6">
      <div className="space-y-3 border-b border-line pb-5">
        <LoadingSkeleton className="h-3 w-28" />
        <LoadingSkeleton className="h-9 w-64 max-w-full" />
        <LoadingSkeleton className="h-4 w-[32rem] max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="panel-card space-y-4 p-6" key={index}>
            <LoadingSkeleton className="h-4 w-28" />
            <LoadingSkeleton className="h-9 w-20" />
            <LoadingSkeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="content-grid">
        <div className="panel-card space-y-4 p-6">
          <LoadingSkeleton className="h-6 w-40" />
          <LoadingSkeleton className="h-52 w-full" />
        </div>
        <div className="panel-card space-y-4 p-6">
          <LoadingSkeleton className="h-6 w-36" />
          {Array.from({ length: 4 }, (_, index) => <LoadingSkeleton className="h-10 w-full" key={index} />)}
        </div>
      </div>
    </div>
  );
}
