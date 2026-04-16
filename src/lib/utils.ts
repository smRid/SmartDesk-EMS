import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  options?: {
    currency?: string;
    locale?: string;
  },
) {
  return new Intl.NumberFormat(options?.locale ?? "en-US", {
    style: "currency",
    currency: options?.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(
  value?: string | Date | null,
  pattern = "MMM d, yyyy",
) {
  if (!value) {
    return "--";
  }

  const parsed = value instanceof Date ? value : parseISO(value);
  return isValid(parsed) ? format(parsed, pattern) : "--";
}

export function calculateLeaveDays(startDate: string, endDate: string) {
  return differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export function parseAmount(
  value: string | number | FormDataEntryValue | null | undefined,
) {
  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }

  if (typeof value === "string") {
    const amount = Number(value);
    return Number.isNaN(amount) ? 0 : amount;
  }

  return 0;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function normaliseSearchParam(
  value?: string | string[] | null,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export function getWelcomeText(name: string, role: "admin" | "employee") {
  if (role === "admin") {
    return "Welcome, Admin";
  }

  return `Welcome, ${name.split(" ")[0]}`;
}

export function statusTone(status: string) {
  const value = status.toLowerCase();

  if (value.includes("approve") || value.includes("active")) {
    return "success";
  }

  if (value.includes("reject") || value.includes("inactive")) {
    return "destructive";
  }

  if (value.includes("pending") || value.includes("leave")) {
    return "warning";
  }

  return "secondary";
}
