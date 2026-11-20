"use client";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState action={<Button onClick={reset}>Try again</Button>} description="Attendance management could not be loaded." title="Attendance unavailable" />;
}
