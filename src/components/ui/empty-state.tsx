import { Inbox } from "lucide-react";

type EmptyStateProps = {
  action?: React.ReactNode;
  description: string;
  title: string;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="panel-card flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-topbar/10 text-topbar">
        <Inbox className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
