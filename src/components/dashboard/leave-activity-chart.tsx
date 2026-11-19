import { cn } from "@/lib/utils";

type LeaveTrendPoint = {
  approved: number;
  key: string;
  label: string;
  pending: number;
  rejected: number;
};

const series = [
  { className: "bg-amber-400", key: "pending", label: "Pending" },
  { className: "bg-emerald-600", key: "approved", label: "Approved" },
  { className: "bg-rose-600", key: "rejected", label: "Rejected" },
] as const;

export function LeaveActivityChart({ data }: { data: LeaveTrendPoint[] }) {
  const maxTotal = Math.max(
    1,
    ...data.map((point) => point.pending + point.approved + point.rejected),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        {series.map((item) => (
          <span className="inline-flex items-center gap-2" key={item.key}>
            <span aria-hidden="true" className={cn("size-2.5 rounded-sm", item.className)} />
            {item.label}
          </span>
        ))}
      </div>

      <div
        aria-label="Leave requests by application month and status"
        className="space-y-3"
        role="img"
      >
        {data.map((point) => {
          const total = point.pending + point.approved + point.rejected;
          return (
            <div className="grid min-w-0 gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)_2rem] sm:items-center" key={point.key}>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {point.label}
              </span>
              <div className="flex h-7 min-w-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                {series.map((item) => {
                  const value = point[item.key];
                  return value > 0 ? (
                    <span
                      aria-hidden="true"
                      className={cn("h-full min-w-1", item.className)}
                      key={item.key}
                      style={{ width: `${(value / maxTotal) * 100}%` }}
                      title={`${item.label}: ${value}`}
                    />
                  ) : null;
                })}
              </div>
              <span className="text-right text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">
                {total}
              </span>
            </div>
          );
        })}
      </div>

      <table className="sr-only">
        <caption>Leave requests grouped by application month and review status</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Pending</th>
            <th>Approved</th>
            <th>Rejected</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.key}>
              <th>{point.label}</th>
              <td>{point.pending}</td>
              <td>{point.approved}</td>
              <td>{point.rejected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
