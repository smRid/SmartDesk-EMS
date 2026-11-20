"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createLeaveRequestAction } from "@/lib/actions";
import { leaveTypeLabels, LEAVE_TYPES } from "@/lib/constants";
import {
  leaveRequestSchema,
  type LeaveRequestInput,
} from "@/lib/validations";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function LeaveRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<LeaveRequestInput>({
    defaultValues: {
      dayFraction: 1,
      endDate: "",
      leaveType: "casual",
      reason: "",
      startDate: "",
    },
    resolver: zodResolver(leaveRequestSchema) as never,
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createLeaveRequestAction(values);

      if (result.status === "error") {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          form.setError(field as keyof LeaveRequestInput, {
            message: message?.[0],
          });
        });
        return;
      }

      toast.success(result.message);
      router.push(result.redirectTo ?? "/employee/leave");
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type</Label>
          <Select id="leaveType" {...form.register("leaveType")}>
            {LEAVE_TYPES.map((option) => (
              <option key={option} value={option}>
                {leaveTypeLabels[option]}
              </option>
            ))}
          </Select>
          <FormError message={form.formState.errors.leaveType?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">From Date</Label>
          <Input id="startDate" type="date" {...form.register("startDate")} />
          <FormError message={form.formState.errors.startDate?.message} />
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="endDate">To Date</Label>
          <Input id="endDate" type="date" {...form.register("endDate")} />
          <FormError message={form.formState.errors.endDate?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dayFraction">Duration</Label>
          <Select id="dayFraction" {...form.register("dayFraction", { valueAsNumber: true })}>
            <option value="1">Full day(s)</option>
            <option value="0.5">Half day</option>
          </Select>
          <FormError message={form.formState.errors.dayFraction?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Description / Reason</Label>
        <Textarea
          id="reason"
          placeholder="Share the reason for this leave request."
          {...form.register("reason")}
        />
        <FormError message={form.formState.errors.reason?.message} />
      </div>

      <Button disabled={isPending} type="submit">
        {isPending ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
