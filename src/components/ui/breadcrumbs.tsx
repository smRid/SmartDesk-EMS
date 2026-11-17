import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <li>
          <Link className="inline-flex size-11 items-center justify-center rounded-md hover:bg-soft hover:text-slate-900 lg:size-9 dark:hover:text-white" href="/" aria-label="Home">
            <Home aria-hidden="true" className="size-3.5" />
          </Link>
        </li>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li className="flex items-center gap-1.5" key={`${item.label}-${index}`}>
              <ChevronRight aria-hidden="true" className="size-3.5 text-slate-300 dark:text-slate-600" />
              {item.href && !current ? (
                <Link className="inline-flex min-h-11 items-center rounded-sm hover:text-slate-900 lg:min-h-9 dark:hover:text-white" href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={current ? "page" : undefined} className={current ? "text-slate-700 dark:text-slate-200" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
