type PageHeaderProps = {
  action?: React.ReactNode;
  description?: string;
  title: string;
};

export function PageHeader({ action, description, title }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
