import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  Settings,
  UserCircle2,
  Users2,
  WalletCards,
} from "lucide-react";

export const APP_NAME = "ArenaDesk EMS";
export const APP_LOGO = "Employee MS";
export const APP_CURRENCY = "USD";
export const SESSION_COOKIE_NAME = "arena_ems_session";

export const USER_ROLES = ["admin", "employee"] as const;
export const GENDER_OPTIONS = ["male", "female", "other"] as const;
export const MARITAL_STATUS_OPTIONS = [
  "single",
  "married",
  "divorced",
  "widowed",
] as const;
export const EMPLOYMENT_STATUSES = [
  "active",
  "on_leave",
  "inactive",
] as const;
export const LEAVE_TYPES = [
  "casual",
  "sick",
  "annual",
  "emergency",
] as const;
export const LEAVE_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const adminNavigation: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/employees", icon: Users2, label: "Employees" },
  { href: "/admin/departments", icon: Building2, label: "Departments" },
  { href: "/admin/leaves", icon: CalendarDays, label: "Leaves" },
  { href: "/admin/salary", icon: WalletCards, label: "Salary" },
  { href: "/admin/settings", icon: Settings, label: "Setting" },
];

export const employeeNavigation: NavItem[] = [
  { href: "/employee/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/employee/profile", icon: UserCircle2, label: "My Profile" },
  { href: "/employee/leave", icon: CalendarDays, label: "Leave" },
  { href: "/employee/salary", icon: WalletCards, label: "Salary" },
  { href: "/employee/settings", icon: Settings, label: "Setting" },
];

export const leaveTypeLabels: Record<(typeof LEAVE_TYPES)[number], string> = {
  annual: "Annual Leave",
  casual: "Casual Leave",
  emergency: "Emergency Leave",
  sick: "Sick Leave",
};

export const genderLabels: Record<(typeof GENDER_OPTIONS)[number], string> = {
  female: "Female",
  male: "Male",
  other: "Other",
};

export const maritalStatusLabels: Record<
  (typeof MARITAL_STATUS_OPTIONS)[number],
  string
> = {
  divorced: "Divorced",
  married: "Married",
  single: "Single",
  widowed: "Widowed",
};

export const employmentStatusLabels: Record<
  (typeof EMPLOYMENT_STATUSES)[number],
  string
> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On Leave",
};
