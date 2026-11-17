import { Inbox, type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  action?: React.ReactNode;
  description: string;
  icon?: LucideIcon;
  title: string;
};

export function EmptyState({ action, description, icon: Icon = Inbox, title }: EmptyStateProps) {
  return (
    <div className="panel-card flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-topbar ring-1 ring-teal-100 dark:bg-teal-950/60 dark:ring-teal-900">
        <Icon aria-hidden="true" className="size-6" />
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
