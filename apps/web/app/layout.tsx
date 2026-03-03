import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@finetech/ui";

export const metadata: Metadata = {
  title: "Finetech Platform",
  description: "Unified financial learning, prediction, and portfolio intelligence.",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell title="Finetech">
          <div className="flex w-full">
            <aside className="w-64 border-r border-slate-800 p-4 hidden md:block">
              <nav className="space-y-2 text-sm">
                <a href="/dashboard" className="block text-slate-200 hover:text-white">
                  Dashboard
                </a>
                <a href="/learn" className="block text-slate-200 hover:text-white">
                  Learn
                </a>
                <a href="/playground" className="block text-slate-200 hover:text-white">
                  Prediction Playground
                </a>
                <a href="/portfolio" className="block text-slate-200 hover:text-white">
                  Portfolio
                </a>
                <a href="/advisor" className="block text-slate-200 hover:text-white">
                  AI Advisor
                </a>
                <a href="/auth/siwe" className="block text-slate-200 hover:text-white">
                  Sign in (SIWE)
                </a>
              </nav>
            </aside>
            <section className="flex-1 p-4 md:p-6">{props.children}</section>
          </div>
        </AppShell>
      </body>
    </html>
  );
}

