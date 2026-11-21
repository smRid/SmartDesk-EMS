"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application route failed", { digest: error.digest });
  }, [error]);

  return <main className="mx-auto flex min-h-screen max-w-xl items-center px-6"><ErrorState
    action={<Button onClick={reset}>Try again</Button>}
    description="The requested page could not be loaded. No changes were made."
    title="Something went wrong"
  /></main>;
}
