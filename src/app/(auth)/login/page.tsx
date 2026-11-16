import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { getCurrentSession, getDashboardRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Welcome",
  description:
    "Secure employee management for teams, leave, payroll, and performance.",
};

const features = [
  {
    description: "Centralized, up-to-date employee information",
    icon: UsersRound,
    title: "Employee Records",
  },
  {
    description: "Track requests, schedules, and team availability",
    icon: CalendarDays,
    title: "Attendance & Leave",
  },
  {
    description: "Turn workforce data into clearer decisions",
    icon: BarChart3,
    title: "Performance Insights",
  },
  {
    description: "Protected access for every role in your organization",
    icon: ShieldCheck,
    title: "Secure & Reliable",
  },
] as const;

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(getDashboardRedirect(session.role));
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7fcfd] text-[#082c55] dark:bg-[#071723] dark:text-slate-100">
      <header className="relative z-20 border-b border-slate-100/90 bg-white/95 dark:border-slate-800 dark:bg-[#091b28]/95">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:gap-5 sm:px-7 lg:px-10"
        >
          <a
            aria-label="ArenaDesk EMS home"
            className="flex min-h-11 shrink-0 items-center gap-2 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#149b91] focus-visible:ring-offset-4 sm:gap-2.5"
            href="#home"
          >
            <span className="grid size-8 place-items-center rounded-[0.65rem] bg-[#149b91] text-white shadow-[0_8px_20px_-10px_rgba(20,155,145,0.8)] sm:size-9 sm:rounded-[0.7rem]">
              <Sparkles className="size-[1.15rem]" aria-hidden="true" />
            </span>
            <span className="text-lg font-black tracking-[-0.04em] sm:text-xl">EMS</span>
            <span className="hidden border-l border-slate-200 pl-3 text-xs font-medium tracking-normal text-[#4c647e] dark:border-slate-700 dark:text-slate-300 lg:inline">
              Employee Management System
            </span>
          </a>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#334e6a] dark:text-slate-300 sm:gap-5 sm:text-sm">
            <a
              className="inline-flex min-h-11 min-w-11 items-center justify-center border-b-2 border-[#149b91] py-5 text-[#087d73]"
              href="#home"
            >
              Home
            </a>
            <a
              className="inline-flex min-h-11 min-w-11 items-center justify-center py-5 transition-colors hover:text-[#087d73]"
              href="#features"
            >
              Features
            </a>
            <a
              className="hidden min-h-11 min-w-11 items-center justify-center py-5 transition-colors hover:text-[#087d73] lg:inline-flex"
              href="#about"
            >
              About
            </a>
            <a
              className="hidden min-h-11 min-w-11 items-center justify-center py-5 transition-colors hover:text-[#087d73] xl:inline-flex"
              href="mailto:support@arenadesk.com"
            >
              Support
            </a>
            <a
              className="inline-flex min-h-11 items-center rounded-lg bg-[#087d73] px-3 py-2 text-white transition-colors hover:bg-[#075f60] focus-visible:ring-2 focus-visible:ring-[#149b91] focus-visible:ring-offset-2 dark:bg-teal-700 dark:hover:bg-teal-600"
              href="#sign-in"
            >
              Sign in
            </a>
          </div>
        </nav>
      </header>

      <main
        className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_76%_8%,rgba(186,235,238,0.68),transparent_38%),linear-gradient(118deg,#ffffff_0%,#f6fcfd_52%,#e7f7f9_100%)] dark:bg-[radial-gradient(circle_at_76%_8%,rgba(15,118,110,0.24),transparent_38%),linear-gradient(118deg,#071723_0%,#0b1f2d_56%,#0c2933_100%)]"
        id="home"
      >
        <div className="pointer-events-none absolute left-[38%] top-24 hidden size-[32rem] rounded-full bg-[radial-gradient(circle,rgba(177,235,229,0.48),transparent_68%)] blur-xl sm:block" />
        <div className="pointer-events-none absolute inset-x-[-8%] bottom-[-11rem] h-64 rotate-[-2deg] rounded-[50%_50%_0_0/45%_55%_0_0] bg-gradient-to-r from-[#159f95] to-[#63d1c8] opacity-80 dark:opacity-45" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-4 pb-24 pt-8 sm:px-7 sm:pb-28 sm:pt-10 md:px-10 md:pt-12 xl:min-h-[calc(100vh-4rem)] xl:grid-cols-[1.08fr_0.92fr] xl:grid-rows-[auto_1fr] xl:content-center xl:items-start xl:gap-x-20 xl:gap-y-7 xl:py-16">
          <section aria-labelledby="hero-title" className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#dcf7f3] px-3.5 py-2 text-xs font-bold text-[#087d73] dark:bg-teal-950/70 dark:text-teal-200">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Streamline your workforce
            </div>

            <h1
              className="mt-5 max-w-2xl text-[clamp(2.25rem,11vw,2.9rem)] font-black leading-[1.02] tracking-[-0.05em] text-[#082c55] dark:text-white sm:text-[clamp(2.8rem,7vw,3.65rem)] xl:text-[clamp(3.5rem,5vw,4.5rem)] xl:leading-[0.98] xl:tracking-[-0.055em]"
              id="hero-title"
            >
              Employee
              <span className="block text-[#0d8078] dark:text-teal-300">Management System</span>
            </h1>

            <p
              className="mt-5 max-w-xl text-[0.95rem] leading-7 text-[#4e6782] dark:text-slate-300 sm:text-base"
              id="about"
            >
              One secure workspace to manage your people, processes, leave, and payroll—so your
              team can focus on doing its best work.
            </p>

          </section>

          <section
            aria-label="Product features"
            className="order-3 min-w-0 xl:order-none xl:col-start-1 xl:row-start-2"
          >
            <div className="grid gap-3 sm:gap-3.5" id="features">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article className="group flex items-center gap-3 sm:gap-3.5" key={feature.title}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e5f7f5] text-[#078c82] transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-teal-950/70 dark:text-teal-200 motion-reduce:transition-none">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-sm font-extrabold text-[#102e4c] dark:text-slate-100">
                        {feature.title}
                      </h2>
                      <p className="mt-0.5 text-xs leading-5 text-[#5b7188] dark:text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="login-title"
            className="order-2 mx-auto w-full max-w-[28rem] scroll-mt-4 rounded-[1.25rem] border border-white/90 bg-white/95 p-5 shadow-[0_28px_70px_-28px_rgba(28,73,98,0.35)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-[#0d2130]/95 sm:scroll-mt-5 sm:rounded-[1.5rem] sm:p-8 xl:order-none xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:my-auto xl:justify-self-end"
            id="sign-in"
          >
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#dff7f4] text-[#07978b] dark:bg-teal-950/80 dark:text-teal-200">
              <ShieldCheck className="size-7" aria-hidden="true" />
            </div>
            <h2
              className="mt-4 text-center text-2xl font-black tracking-[-0.04em] text-[#082c55] dark:text-white"
              id="login-title"
            >
              Welcome back
            </h2>
            <p className="mb-7 mt-1.5 text-center text-sm text-[#637990] dark:text-slate-400">
              Sign in to access your EMS workspace
            </p>
            <LoginForm />
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-[#6a7f94] dark:border-slate-700 dark:text-slate-400">
              <ShieldCheck className="size-3.5 text-[#149b91]" aria-hidden="true" />
              Protected with secure, role-based access
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
