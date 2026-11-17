"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isPending?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  variant?: "default" | "destructive";
};

export function ConfirmDialog({ cancelLabel = "Cancel", confirmLabel = "Confirm", description, isPending, onConfirm, onOpenChange, open, title, variant = "default" }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog aria-describedby={descriptionId} aria-labelledby={titleId} ref={dialogRef} onCancel={(event) => { event.preventDefault(); if (!isPending) onOpenChange(false); }} onClose={() => onOpenChange(false)} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-card p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/55 dark:text-slate-100">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-warning dark:bg-amber-950/50"><AlertTriangle aria-hidden="true" className="size-5" /></div>
          <Button aria-label="Close dialog" disabled={isPending} onClick={() => onOpenChange(false)} size="icon" type="button" variant="ghost"><X aria-hidden="true" className="size-4" /></Button>
        </div>
        <h2 className="mt-5 text-xl font-bold tracking-tight" id={titleId}>{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted" id={descriptionId}>{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={isPending} onClick={() => onOpenChange(false)} type="button" variant="outline">{cancelLabel}</Button>
          <Button disabled={isPending} onClick={onConfirm} type="button" variant={variant === "destructive" ? "destructive" : "default"}>{isPending ? "Working…" : confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
