import type { Metadata } from "next";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import "./globals.css";

const themeInitScript = `
(() => {
  try {
    const theme = window.localStorage.getItem("arenadesk-theme") === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    document.body?.classList.toggle("dark", theme === "dark");
    if (document.body) {
      document.body.dataset.theme = theme;
    }
  } catch (_) {
    document.documentElement.dataset.theme = "light";
    if (document.body) {
      document.body.dataset.theme = "light";
    }
  }
})();
`;

export const metadata: Metadata = {
  title: {
    default: "ArenaDesk EMS",
    template: "%s | ArenaDesk EMS",
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
      className="h-full bg-shell antialiased"
      data-scroll-behavior="smooth"
      data-theme="light"
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-shell font-sans text-slate-900"
        data-theme="light"
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
