import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  Check,
  Files,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { getCurrentSession, getDashboardRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Access the ArenaDesk employee management workspace for people, leave, and salary records.",
};

const features = [
  {
    description: "Keep employee profiles, departments, and employment details organized.",
    icon: UsersRound,
    title: "Employee records",
  },
  {
    description: "Submit, review, and track leave requests from one shared workflow.",
    icon: CalendarCheck2,
    title: "Leave workflows",
  },
  {
    description: "Maintain salary entries and let employees review their own history.",
    icon: WalletCards,
    title: "Salary history",
  },
] as const;

const previewNavigation = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: UsersRound, label: "Employees" },
  { icon: Building2, label: "Departments" },
  { icon: CalendarCheck2, label: "Leave requests" },
] as const;

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(getDashboardRedirect(session.role));
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950 dark:bg-[#08111f] dark:text-slate-100">
      <header className="relative z-20 border-b border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#0b1524]">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex min-h-16 w-full max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10"
        >
          <a
            aria-label="ArenaDesk EMS home"
            className="flex min-h-11 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            href="#home"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#0f766e] text-sm font-black tracking-tight text-white shadow-[0_10px_24px_-12px_rgba(15,118,110,0.8)]">
              AD
            </span>
            <span>
              <span className="block text-sm font-extrabold leading-4 tracking-[-0.025em] text-slate-950 dark:text-white">
                ArenaDesk
              </span>
              <span className="block text-[0.625rem] font-bold uppercase leading-4 tracking-[0.16em] text-slate-500 dark:text-slate-400 max-[399px]:hidden">
                Employee management
              </span>
            </span>
          </a>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <a
              className="hidden min-h-11 items-center px-2 text-sm font-semibold text-slate-600 transition-colors hover:text-teal-800 focus-visible:rounded-lg dark:text-slate-300 dark:hover:text-teal-300 sm:inline-flex"
              href="#capabilities"
            >
              Capabilities
            </a>
            <div className="rounded-lg bg-slate-900 dark:bg-slate-800">
              <ThemeToggle />
            </div>
            <a
              className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#0f766e] px-3.5 text-sm font-bold text-white transition-colors hover:bg-[#115e59] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              href="#sign-in"
            >
              Sign in
              <ArrowRight className="size-4 max-[359px]:hidden" aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      <main id="home">
        <div className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f8fafc] dark:border-slate-800 dark:bg-[#08111f]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.42] dark:opacity-[0.18]" aria-hidden="true">
            <div className="absolute inset-y-0 right-[-16rem] w-[42rem] rotate-12 border-l border-teal-500/20 bg-[linear-gradient(135deg,transparent_34%,rgba(13,148,136,0.08)_34%,rgba(13,148,136,0.08)_66%,transparent_66%)]" />
            <div className="absolute left-[8%] top-[-12rem] size-[28rem] rounded-full border-[5rem] border-slate-200/60 dark:border-slate-700/40" />
          </div>

          <div className="relative mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-center lg:gap-14 lg:px-10 lg:py-20 xl:grid-cols-[minmax(0,1.08fr)_29rem]">
            <section aria-labelledby="hero-title" className="order-2 min-w-0 lg:order-1">
              <div className="inline-flex min-h-8 items-center gap-2 border-l-2 border-teal-600 pl-3 text-xs font-extrabold uppercase tracking-[0.16em] text-teal-800 dark:text-teal-300">
                <ShieldCheck className="size-4" aria-hidden="true" />
                One workspace. Clear responsibilities.
              </div>

              <h1
                className="mt-5 max-w-3xl text-[clamp(2.35rem,8.8vw,3.8rem)] font-black leading-[1.01] tracking-[-0.05em] text-[#0f172a] dark:text-white lg:text-[2.9rem] xl:text-[3.75rem] 2xl:text-[4.25rem]"
                id="hero-title"
              >
                People operations,
                <span className="block text-[#0f766e] dark:text-teal-300">kept in order.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                ArenaDesk brings employee records, leave requests, and salary history into a
                focused workspace for administrators and employees.
              </p>

              <div className="mt-8 grid max-w-3xl gap-5 border-y border-slate-200 py-6 dark:border-slate-700 sm:grid-cols-3" id="capabilities">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article className="flex gap-3 sm:block" key={feature.title}>
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-800 dark:bg-teal-950/70 dark:text-teal-200">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="sm:mt-3">
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {feature.title}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                          {feature.description}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <figure className="relative mt-9 hidden max-w-3xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_30px_70px_-45px_rgba(15,23,42,0.55)] dark:border-slate-700 dark:bg-slate-900 md:block">
                <div className="flex h-8 items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
                  <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="size-2 rounded-full bg-teal-600" />
                  <figcaption className="ml-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Workspace preview
                  </figcaption>
                </div>
                <div className="grid min-h-52 grid-cols-[10rem_1fr]">
                  <div className="bg-[#0f172a] p-4 text-white">
                    <p className="text-sm font-black tracking-tight">ArenaDesk</p>
                    <div className="mt-5 space-y-1.5">
                      {previewNavigation.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div className={`flex items-center gap-2 rounded-md px-2 py-2 text-[0.675rem] font-semibold ${index === 0 ? "bg-teal-700 text-white" : "text-slate-300"}`} key={item.label}>
                            <Icon className="size-3.5" aria-hidden="true" />
                            {item.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-teal-800 dark:text-teal-300">Overview</p>
                        <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">Operations workspace</p>
                      </div>
                      <span className="rounded-md bg-teal-50 px-2 py-1 text-[0.625rem] font-bold text-teal-800 dark:bg-teal-950/70 dark:text-teal-200">Role-aware view</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      {["Employee records", "Leave activity", "Salary history"].map((label) => (
                        <div className="min-h-20 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800" key={label}>
                          <Check className="size-4 text-teal-700 dark:text-teal-300" aria-hidden="true" />
                          <p className="mt-3 text-[0.675rem] font-bold leading-4 text-slate-700 dark:text-slate-200">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </figure>
            </section>

            <section
              aria-labelledby="login-title"
              className="relative order-1 scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_28px_75px_-40px_rgba(15,23,42,0.55)] dark:border-slate-700 dark:bg-[#101b2c] sm:p-8 lg:order-2 lg:sticky lg:top-8"
              id="sign-in"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-teal-700" aria-hidden="true" />
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-slate-900 text-white dark:bg-teal-800">
                  <Files className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-teal-800 dark:text-teal-300">
                    Workspace access
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 dark:text-white" id="login-title">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Sign in with your assigned account.
                  </p>
                </div>
              </div>

              <div className="my-6 border-t border-slate-200 dark:border-slate-700" />
              <LoginForm />

              <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700">
                <div className="flex gap-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-700 dark:text-teal-300" aria-hidden="true" />
                  <p>
                    Role-aware access directs each account to its permitted workspace. Session
                    cookies are HTTP-only.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white px-4 py-5 text-center text-xs text-slate-500 dark:bg-[#0b1524] dark:text-slate-400 sm:px-6">
        ArenaDesk EMS · Employee operations, organized.
      </footer>
    </div>
  );
}
