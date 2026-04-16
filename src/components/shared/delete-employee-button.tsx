"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteEmployeeAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function DeleteEmployeeButton({
  employeeRecordId,
}: {
  employeeRecordId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        const confirmed = window.confirm(
          "Deactivate this employee? Their leave and salary history will remain available.",
        );

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const result = await deleteEmployeeAction(employeeRecordId);

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
      {isPending ? "Removing..." : "Delete"}
    </Button>
  );
}
