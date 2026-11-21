import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return <main className="mx-auto flex min-h-screen max-w-xl items-center px-6"><EmptyState
    action={<Button asChild><Link href="/">Return home</Link></Button>}
    description="The page may have moved, or you may not have access to it."
    title="Page not found"
  /></main>;
}
