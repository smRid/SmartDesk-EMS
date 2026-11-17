import { AlertTriangle } from "lucide-react";

type ErrorStateProps = { action?: React.ReactNode; description?: string; title?: string };

export function ErrorState({ action, description = "Something went wrong. Please try again.", title = "Unable to load this content" }: ErrorStateProps) {
  return (
    <div className="panel-card flex flex-col items-center gap-4 border-rose-200 px-6 py-12 text-center dark:border-rose-900/70" role="alert">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-danger dark:bg-rose-950/50"><AlertTriangle aria-hidden="true" className="size-6" /></div>
      <div className="space-y-1"><h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2><p className="max-w-md text-sm text-muted">{description}</p></div>
      {action}
    </div>
  );
}
