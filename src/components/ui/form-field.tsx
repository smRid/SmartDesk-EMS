import { cloneElement, useId, type ReactElement } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldControlProps = { "aria-describedby"?: string; "aria-invalid"?: boolean };
type FormFieldProps = { children: ReactElement<FieldControlProps>; className?: string; description?: string; error?: string; htmlFor: string; label: string; required?: boolean };

export function FormField({ children, className, description, error, htmlFor, label, required }: FormFieldProps) {
  const generatedId = useId();
  const descriptionId = `${generatedId}-description`;
  const errorId = `${generatedId}-error`;
  const describedBy = error ? errorId : description ? descriptionId : undefined;
  const control = cloneElement(children, { "aria-describedby": describedBy, "aria-invalid": Boolean(error) });
  return <div className={cn("space-y-2", className)}><Label htmlFor={htmlFor}>{label}{required ? <span className="ml-1 text-danger" aria-hidden="true">*</span> : null}</Label>{control}{description && !error ? <p className="text-xs text-muted" id={descriptionId}>{description}</p> : null}{error ? <p className="text-xs font-medium text-danger" id={errorId} role="alert">{error}</p> : null}</div>;
}
