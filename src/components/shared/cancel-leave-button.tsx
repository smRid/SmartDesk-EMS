"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelLeaveRequestAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function CancelLeaveButton({ leaveId }: { leaveId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <Button disabled={pending} onClick={() => startTransition(async () => {
    const result = await cancelLeaveRequestAction(leaveId);
    if (result.status === "success") toast.success(result.message);
    else toast.error(result.message);
    router.refresh();
  })} size="sm" type="button" variant="destructive">{pending ? "Cancelling..." : "Cancel"}</Button>;
}
