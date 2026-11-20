"use client";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error; reset: () => void }) { return <ErrorState action={<Button onClick={reset}>Try again</Button>} description="Attendance could not be loaded." title="Attendance unavailable" />; }
