"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="rounded-lg bg-sidebar/40 px-4 text-white hover:bg-sidebar/60"
      onClick={() =>
        startTransition(async () => {
          const result = await logoutAction();

          if (result.status === "success" && result.redirectTo) {
            toast.success(result.message);
            router.push(result.redirectTo);
            router.refresh();
            return;
          }

          toast.error(result.message);
        })
      }
      size="sm"
      type="button"
      variant="ghost"
      disabled={isPending}
    >
      <LogOut className="size-4" />
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
