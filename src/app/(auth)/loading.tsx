import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function AuthRouteLoading() {
  return <div aria-busy="true" aria-label="Loading authentication page" className="panel-card mx-auto w-full max-w-md space-y-5 p-7">
    <LoadingSkeleton className="h-8 w-48" />
    <LoadingSkeleton className="h-4 w-64 max-w-full" />
    <LoadingSkeleton className="h-12 w-full" />
    <LoadingSkeleton className="h-12 w-full" />
    <LoadingSkeleton className="h-12 w-full" />
  </div>;
}
