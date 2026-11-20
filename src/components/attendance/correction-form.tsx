"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { requestAttendanceCorrectionAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CorrectionForm({ recordId }: { recordId: string }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [pending, startTransition] = useTransition();
  if (!open) return <Button onClick={() => setOpen(true)} size="sm" type="button" variant="outline">Request correction</Button>;
  return <form className="min-w-64 space-y-2" onSubmit={(event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const toIso = (value: FormDataEntryValue | null) => value ? new Date(String(value)).toISOString() : undefined;
    startTransition(async () => {
      const result = await requestAttendanceCorrectionAction({ recordId, reason: String(data.get("reason") ?? ""), requestedCheckInAt: toIso(data.get("checkIn")), requestedCheckOutAt: toIso(data.get("checkOut")) });
      if (result.status === "success") { toast.success(result.message); setOpen(false); }
      else toast.error(result.message);
      router.refresh();
    });
  }}><Input aria-label="Corrected check in" name="checkIn" type="datetime-local" /><Input aria-label="Corrected check out" name="checkOut" type="datetime-local" /><Textarea aria-label="Correction reason" name="reason" placeholder="Explain the correction" required /><div className="flex gap-2"><Button disabled={pending} size="sm" type="submit">Submit</Button><Button onClick={() => setOpen(false)} size="sm" type="button" variant="ghost">Cancel</Button></div></form>;
}
