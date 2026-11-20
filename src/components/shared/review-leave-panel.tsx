"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { reviewLeaveRequestAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReviewLeavePanel({ leaveId }: { leaveId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [exceptionApproved, setExceptionApproved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const review = (status: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await reviewLeaveRequestAction({
        adminNote: note,
        exceptionApproved,
        leaveId,
        status,
      });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="adminNote">Admin Note</Label>
        <Textarea
          id="adminNote"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Share a short note for the employee."
          value={note}
        />
      </div>
      <label className="flex items-start gap-2 text-sm"><input checked={exceptionApproved} onChange={(event) => setExceptionApproved(event.target.checked)} type="checkbox" /><span>Exception approval (only when policy permits a negative balance)</span></label>

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={isPending}
          onClick={() => review("approved")}
          type="button"
          variant="success"
        >
          Approve
        </Button>
        <Button
          disabled={isPending}
          onClick={() => review("rejected")}
          type="button"
          variant="destructive"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
