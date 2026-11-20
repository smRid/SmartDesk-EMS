"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { punchAttendanceAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function PunchControls({ hasOpenSession }: { hasOpenSession: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [online, setOnline] = useState(true);
  const punch = () => {
    if (!navigator.onLine) { setOnline(false); toast.error("You are offline. Reconnect before recording attendance."); return; }
    setOnline(true);
    startTransition(async () => {
      const result = await punchAttendanceAction({ idempotencyKey: crypto.randomUUID(), type: hasOpenSession ? "check_out" : "check_in" });
      if (result.status === "success") toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  };
  return <div><Button disabled={pending} onClick={punch} size="lg" type="button" variant={hasOpenSession ? "warning" : "success"}>{pending ? "Recording trusted time..." : hasOpenSession ? "Check Out" : "Check In"}</Button>{!online ? <p className="mt-2 text-sm text-danger">Offline — attendance was not sent.</p> : null}</div>;
}
