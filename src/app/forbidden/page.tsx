import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shell px-4">
      <Card className="max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <ShieldAlert className="size-6" />
          </div>
          <CardTitle className="pt-4 text-3xl">Access Forbidden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-slate-500">
            You do not have permission to access this page. Sign in with the right
            account or head back to the appropriate dashboard.
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
