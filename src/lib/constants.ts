export const APP_NAME = "SmartDesk EMS";
export const APP_LOGO = "Smart\nDesk";
export const APP_CURRENCY = "USD";
export const SESSION_COOKIE_NAME = "smartdesk_ems_session";

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
  "cancelled",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type NavIcon =
  | "building2"
  | "calendarDays"
  | "layoutDashboard"
  | "settings"
  | "userCircle2"
  | "users2"
  | "walletCards";

export type NavItem = {
  href: string;
  icon: NavIcon;
  label: string;
};

export const adminNavigation: NavItem[] = [
  { href: "/admin/dashboard", icon: "layoutDashboard", label: "Dashboard" },
  { href: "/admin/employees", icon: "users2", label: "Employees" },
  { href: "/admin/departments", icon: "building2", label: "Departments" },
  { href: "/admin/leaves", icon: "calendarDays", label: "Leave Requests" },
  { href: "/admin/salary", icon: "walletCards", label: "Salary" },
  { href: "/admin/settings", icon: "settings", label: "Settings" },
];

export const employeeNavigation: NavItem[] = [
  { href: "/employee/dashboard", icon: "layoutDashboard", label: "My Dashboard" },
  { href: "/employee/profile", icon: "userCircle2", label: "My Profile" },
  { href: "/employee/leave", icon: "calendarDays", label: "My Leave" },
  { href: "/employee/salary", icon: "walletCards", label: "My Salary" },
  { href: "/employee/settings", icon: "settings", label: "Settings" },
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
