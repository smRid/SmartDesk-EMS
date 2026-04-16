"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteDepartmentAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function DeleteDepartmentButton({
  departmentId,
}: {
  departmentId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        const confirmed = window.confirm(
          "Delete this department? Employees must already be reassigned.",
        );

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const result = await deleteDepartmentAction(departmentId);

          if (result.status === "error") {
            toast.error(result.message);
            return;
          }

          toast.success(result.message);
          router.refresh();
        });
      }}
      size="sm"
      type="button"
      variant="destructive"
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
