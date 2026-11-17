import { CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";

type DateRangeFilterProps = { from?: string; fromName?: string; to?: string; toName?: string };

export function DateRangeFilter({ from, fromName = "from", to, toName = "to" }: DateRangeFilterProps) {
  return <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="sr-only">Date range</legend><label className="relative"><span className="sr-only">From date</span><CalendarRange aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input className="pl-9" defaultValue={from} name={fromName} type="date" /></label><label><span className="sr-only">To date</span><Input defaultValue={to} name={toName} type="date" /></label></fieldset>;
}
