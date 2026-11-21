import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, FileText, LayoutDashboard, LockKeyhole, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { getCurrentSession, getDashboardRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access the SmartDesk employee management workspace for people, attendance, leave, and salary records.",
};

const capabilities = [
  { description: "Keep employee profiles, departments, and employment details in one place.", icon: UsersRound, title: "Employee records" },
  { description: "Track attendance and manage leave requests through clear workflows.", icon: CalendarDays, title: "Attendance & leave" },
  { description: "Maintain salary records and provide secure access to payslips.", icon: WalletCards, title: "Salary & payslips" },
  { description: "Keep administrator and employee access separated by account role.", icon: ShieldCheck, title: "Secure role access" },
] as const;

const previewNavigation = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: UsersRound, label: "Employees" },
  { icon: CalendarDays, label: "Attendance" },
  { icon: FileText, label: "Leave" },
] as const;

const previewStats = [
  { icon: UsersRound, label: "Active", value: "142" },
  { icon: CalendarDays, label: "On leave", value: "8" },
  { icon: CheckCircle2, label: "Present", value: "134" },
] as const;

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session) redirect(getDashboardRedirect(session.role));

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7fbfc] text-[#0d2138] dark:bg-[#07131d] dark:text-slate-100">
      <header className="relative z-30 border-b border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-[#0a1824]/95">
        <nav aria-label="Main navigation" className="mx-auto flex min-h-[4.5rem] w-full max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-7 xl:px-12">
          <a aria-label="SmartDesk EMS home" className="flex min-h-11 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-600" href="#home">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#078f83] dark:bg-teal-950/70 dark:text-teal-200"><UsersRound className="size-6" aria-hidden="true" /></span>
            <span className="text-xl font-black tracking-[-0.04em] text-[#0d2138] dark:text-white sm:text-2xl">SmartDesk <span className="text-[#078f83]">EMS</span></span>
            <span className="hidden h-7 w-px bg-slate-200 dark:bg-slate-700 md:block" aria-hidden="true" />
            <span className="hidden text-sm font-semibold text-slate-600 dark:text-slate-300 md:block lg:text-base">Employee Management System</span>
          </a>
          <div className="flex items-center gap-1 sm:gap-3 lg:gap-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"><ThemeToggle /></div>
          </div>
        </nav>
      </header>

      <main className="relative isolate" id="home">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(255,255,255,0.98)_0%,rgba(248,252,253,0.94)_40%,rgba(218,244,246,0.72)_100%)] dark:bg-[linear-gradient(112deg,#07131d_0%,#0a1b27_55%,#0d2931_100%)]" />
          <div className="absolute -right-24 top-0 h-[42rem] w-[48rem] rotate-[-8deg] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_5rem,rgba(8,145,133,0.07)_5.05rem,rgba(8,145,133,0.07)_5.18rem)]" />
          <div className="absolute left-[33%] top-[10%] size-[34rem] rounded-full bg-teal-200/25 blur-3xl dark:bg-teal-700/10" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-4.5rem)] w-full max-w-[100rem] gap-10 px-4 pb-32 pt-10 sm:px-7 sm:pt-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)] lg:items-center lg:gap-12 lg:px-10 lg:pb-36 lg:pt-12 xl:grid-cols-[minmax(0,1.5fr)_29rem] xl:px-12 2xl:gap-20">
          <section aria-labelledby="hero-title" className="min-w-0">
            <div className="inline-flex min-h-9 items-center gap-2 border-l-2 border-[#078f83] pl-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#087f76] dark:text-teal-200 sm:text-sm"><ShieldCheck className="size-4" aria-hidden="true" />One workspace. Clear responsibilities.</div>
            <h1 className="mt-5 max-w-3xl text-[clamp(2.6rem,7vw,5.2rem)] font-black leading-[0.96] tracking-[-0.055em] text-[#0c223a] dark:text-white" id="hero-title">People operations,<span className="block text-[#078f83] dark:text-teal-300">kept in order.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#425d77] dark:text-slate-300 sm:text-lg sm:leading-8">SmartDesk brings employee records, leave requests, and salary history into a focused workspace for administrators and employees.</p>

            <div className="relative mt-8 grid gap-8 xl:grid-cols-[minmax(18rem,0.72fr)_minmax(23rem,1fr)] xl:items-end" id="features">
              <div className="space-y-4">
                {capabilities.map((capability) => { const Icon = capability.icon; return (
                  <article className="group flex items-start gap-4" key={capability.title}>
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e2f7f4] text-[#078f83] transition-transform group-hover:-translate-y-0.5 dark:bg-teal-950/80 dark:text-teal-200"><Icon className="size-5" aria-hidden="true" /></span>
                    <div className="pt-0.5"><h2 className="text-base font-extrabold text-[#10243a] dark:text-white">{capability.title}</h2><p className="mt-1 max-w-sm text-sm leading-5 text-[#526b82] dark:text-slate-400">{capability.description}</p></div>
                  </article>
                ); })}
              </div>

              <figure className="relative hidden pb-4 md:block" aria-label="SmartDesk workspace preview">
                <div className="absolute left-1/2 top-1/2 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-200/45 blur-xl dark:bg-teal-700/20" />
                <div className="relative mx-auto max-w-[34rem] rotate-[-2deg] rounded-[1.45rem] border-[0.7rem] border-[#1a3346] bg-[#122536] shadow-[0_32px_55px_-22px_rgba(13,33,56,0.55)] transition-transform duration-500 hover:rotate-0 dark:border-[#122536] motion-reduce:transition-none">
                  <div className="absolute left-1/2 top-[-0.42rem] size-1.5 -translate-x-1/2 rounded-full bg-slate-500" />
                  <div className="grid min-h-[17rem] overflow-hidden rounded-[0.72rem] bg-[#f8fbfc] text-[#172b42] dark:bg-slate-950 dark:text-slate-100 sm:grid-cols-[7rem_1fr]">
                    <aside className="hidden bg-[#0b4f50] p-3 text-white sm:block"><p className="flex items-center gap-1.5 text-xs font-black"><UsersRound className="size-4 text-teal-200" aria-hidden="true" /> EMS</p><div className="mt-5 space-y-1">{previewNavigation.map((item, index) => { const Icon = item.icon; return <div className={`flex items-center gap-1.5 rounded-md px-2 py-2 text-[0.55rem] font-semibold ${index === 0 ? "bg-[#0a9a8b] text-white" : "text-teal-50/80"}`} key={item.label}><Icon className="size-3" aria-hidden="true" />{item.label}</div>; })}</div></aside>
                    <div className="p-4"><p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[#0a897f]">Overview</p><p className="mt-1 text-base font-black">Dashboard</p>
                      <div className="mt-3 grid grid-cols-3 gap-2">{previewStats.map((stat) => { const Icon = stat.icon; return <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-700" key={stat.label}><Icon className="size-3.5 text-[#089488]" aria-hidden="true" /><p className="mt-2 text-sm font-black">{stat.value}</p><p className="text-[0.5rem] text-slate-500 dark:text-slate-400">{stat.label}</p></div>; })}</div>
                      <div className="mt-3 grid grid-cols-[1.35fr_0.65fr] gap-2"><div className="rounded-lg bg-white p-3 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-700"><p className="text-[0.55rem] font-bold">Attendance overview</p><div className="mt-3 flex h-14 items-end gap-1">{[35, 52, 43, 68, 58, 82, 72, 92].map((height, index) => <span className="flex-1 rounded-t-sm bg-[#22b7a8]" key={index} style={{ height: `${height}%` }} />)}</div></div><div className="grid place-items-center rounded-lg bg-white p-2 text-center ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-700"><div className="grid size-14 place-items-center rounded-full border-[0.45rem] border-[#19a99b] border-r-teal-100"><span className="text-xs font-black">94%</span></div><p className="text-[0.5rem] text-slate-500">Present today</p></div></div>
                    </div>
                  </div>
                </div>
                <div className="relative mx-auto h-3 w-[93%] rounded-b-[80%] bg-gradient-to-b from-slate-300 to-slate-500 shadow-[0_12px_18px_-8px_rgba(15,23,42,0.5)] dark:from-slate-600 dark:to-slate-800" />
              </figure>
            </div>
          </section>

          <section aria-labelledby="login-title" className="relative z-10 scroll-mt-6 rounded-[1.6rem] border border-white/80 bg-white/95 p-5 shadow-[0_35px_80px_-38px_rgba(11,68,76,0.48)] backdrop-blur-sm dark:border-slate-700 dark:bg-[#0d1e2b]/95 sm:p-8 lg:p-9" id="sign-in">
            <div className="text-center"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#e0f6f3] text-[#078f83] dark:bg-teal-950/80 dark:text-teal-200"><UsersRound className="size-8" aria-hidden="true" /></span><h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#0d2138] dark:text-white" id="login-title">Welcome back</h2><p className="mt-2 text-sm text-[#526b82] dark:text-slate-400 sm:text-base">Sign in to access your SmartDesk account</p></div>
            <div className="mt-7"><LoginForm /></div>
            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700" id="security"><div className="flex items-start justify-center gap-2 text-xs leading-5 text-slate-600 dark:text-slate-400"><LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-[#078f83]" aria-hidden="true" /><p>Protected access for administrators and employees.</p></div></div>
          </section>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden" aria-hidden="true"><div className="absolute -bottom-24 -left-[5%] h-40 w-[115%] rotate-[-3deg] rounded-[50%] bg-[#75d9d1]/75 dark:bg-teal-800/50" /><div className="absolute -bottom-28 -left-[4%] h-40 w-[112%] rotate-[2deg] rounded-[48%] bg-[#09a597]/75 dark:bg-teal-700/70" /><div className="absolute -bottom-32 -left-[2%] h-40 w-[108%] rotate-[-1deg] rounded-[50%] bg-[#087f77] dark:bg-teal-900" /></div>
      </main>
    </div>
  );
}
