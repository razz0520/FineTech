import type { Metadata } from "next";
import Link from "next/link";

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
                <Link href="/dashboard" className="block text-slate-200 hover:text-white">
                  Dashboard
                </Link>
                <Link href="/learn" className="block text-slate-200 hover:text-white">
                  Learn
                </Link>
                <Link href="/playground" className="block text-slate-200 hover:text-white">
                  Prediction Playground
                </Link>
                <Link href="/portfolio" className="block text-slate-200 hover:text-white">
                  Portfolio
                </Link>
                <Link href="/advisor" className="block text-slate-200 hover:text-white">
                  AI Advisor
                </Link>
                <Link href="/auth/siwe" className="block text-slate-200 hover:text-white">
                  Sign in (SIWE)
                </Link>
              </nav>
            </aside>
            <section className="flex-1 p-4 md:p-6">{props.children}</section>
          </div>
        </AppShell>
      </body>
    </html>
  );
}
