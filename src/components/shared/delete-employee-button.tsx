"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteEmployeeAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteEmployeeButton({
  employeeRecordId,
}: {
  employeeRecordId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteEmployeeAction(employeeRecordId);
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
      {isPending ? "Deactivating..." : "Deactivate"}
    </Button>
    <ConfirmDialog confirmLabel="Deactivate employee" description="Their account access will be disabled while leave and salary history remains available." isPending={isPending} onConfirm={confirmDelete} onOpenChange={setOpen} open={open} title="Deactivate this employee?" variant="destructive" />
  </>;
}
