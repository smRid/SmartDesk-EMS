"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteDepartmentAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteDepartmentButton({
  departmentId,
}: {
  departmentId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteDepartmentAction(departmentId);
      if (result.status === "error") { toast.error(result.message); return; }
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  return <>
    <Button
      disabled={isPending}
      onClick={() => setOpen(true)}
      size="sm"
      type="button"
      variant="destructive"
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
    <ConfirmDialog confirmLabel="Delete department" description="This cannot be undone. All active employees must be reassigned before the department can be deleted." isPending={isPending} onConfirm={confirmDelete} onOpenChange={setOpen} open={open} title="Delete this department?" variant="destructive" />
  </>;
}
