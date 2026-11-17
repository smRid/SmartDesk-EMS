type PageHeaderProps = {
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageHeader({ action, breadcrumbs, description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 space-y-2">
        {breadcrumbs}
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-topbar">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}
