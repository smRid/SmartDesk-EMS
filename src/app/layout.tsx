import type { Metadata } from "next";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import "./globals.css";

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
    <html lang="en" className="h-full bg-shell antialiased">
      <body className="flex min-h-full flex-col bg-shell font-sans text-slate-900">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
