"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reviewAttendanceCorrectionAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function CorrectionReview({ adjustmentId }: { adjustmentId: string }) {
  const router = useRouter(); const [note, setNote] = useState(""); const [pending, startTransition] = useTransition();
  const review = (status: "approved" | "rejected") => startTransition(async () => { const result = await reviewAttendanceCorrectionAction({ adjustmentId, note, status }); if (result.status === "success") toast.success(result.message); else toast.error(result.message); router.refresh(); });
  return <div className="space-y-2"><Input onChange={(e) => setNote(e.target.value)} placeholder="Reviewer note" value={note} /><div className="flex gap-2"><Button disabled={pending} onClick={() => review("approved")} size="sm" type="button" variant="success">Approve</Button><Button disabled={pending} onClick={() => review("rejected")} size="sm" type="button" variant="destructive">Reject</Button></div></div>;
}
