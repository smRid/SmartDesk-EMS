import type { Metadata } from "next";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import "./globals.css";

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("smartdesk-theme");
    const theme = storedTheme === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    document.body?.classList.toggle("dark", theme === "dark");
    if (document.body) {
      document.body.dataset.theme = theme;
    }
  } catch (_) {
    document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = "dark";
    if (document.body) {
      document.body.classList.add("dark");
      document.body.dataset.theme = "dark";
    }
  }
})();
`;

const bodyThemeSyncScript = `
(() => {
  const isDark = document.documentElement.dataset.theme !== "light";
  document.body.classList.toggle("dark", isDark);
  document.body.dataset.theme = isDark ? "dark" : "light";
})();
`;

export const metadata: Metadata = {
  title: {
    default: "SmartDesk EMS",
    template: "%s | SmartDesk EMS",
  },
  description:
    "Production-ready employee management system with admin and employee dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full bg-shell antialiased"
      data-scroll-behavior="smooth"
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="dark flex min-h-full flex-col bg-shell font-sans text-slate-900"
        data-theme="dark"
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: bodyThemeSyncScript }} />
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
