"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function EmployeeDashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState action={<Button onClick={reset}>Try again</Button>} description="Your dashboard data could not be loaded. No changes were made." title="Unable to load your dashboard" />;
}
