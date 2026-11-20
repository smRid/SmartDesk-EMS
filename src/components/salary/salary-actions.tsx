"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { transitionSalaryAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function SalaryActions({ salaryId, status }: { salaryId: string; status: "draft" | "approved" | "finalized" | "paid" }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const transition = status === "draft" ? "approve" : status === "approved" ? "finalize" : status === "finalized" ? "pay" : null;
  return <div className="flex flex-wrap gap-2">{transition ? <Button disabled={pending} onClick={() => startTransition(async () => {
    const result = await transitionSalaryAction({ salaryId, transition });
    if (result.status === "success") toast.success(result.message); else toast.error(result.message);
    router.refresh();
  })} size="sm" type="button" variant="outline">{pending ? "Saving..." : transition === "approve" ? "Approve" : transition === "finalize" ? "Finalize" : "Mark paid"}</Button> : null}
  {status === "finalized" || status === "paid" ? <Button asChild size="sm" variant="secondary"><a href={`/salary/${salaryId}/payslip`}>Payslip PDF</a></Button> : null}</div>;
}
