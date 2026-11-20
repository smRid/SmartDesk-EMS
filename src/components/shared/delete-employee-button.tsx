"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteEmployeeAction, reactivateEmployeeAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteEmployeeButton({
  employeeRecordId,
  isActive = true,
}: {
  employeeRecordId: string;
  isActive?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    startTransition(async () => {
      const result = isActive
        ? await deleteEmployeeAction(employeeRecordId)
        : await reactivateEmployeeAction(employeeRecordId);
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
      variant={isActive ? "destructive" : "success"}
    >
      {isPending ? "Saving..." : isActive ? "Deactivate" : "Reactivate"}
    </Button>
    <ConfirmDialog confirmLabel={isActive ? "Deactivate employee" : "Reactivate employee"} description={isActive ? "Their account access will be disabled while leave and salary history remains available." : "Their account access will be restored and employment status set to active."} isPending={isPending} onConfirm={confirmDelete} onOpenChange={setOpen} open={open} title={isActive ? "Deactivate this employee?" : "Reactivate this employee?"} variant={isActive ? "destructive" : "default"} />
  </>;
}
