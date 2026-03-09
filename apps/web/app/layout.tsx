import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";
import { AppShell } from "@finetech/ui";
import { SidebarNav } from "./sidebar-nav";

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
            {/* Desktop sidebar */}
            <aside className="w-64 border-r border-white/5 hidden md:flex flex-col shrink-0 bg-slate-950/30 backdrop-blur-sm">
              <SidebarNav />
            </aside>
            {/* Main content */}
            <section className="flex-1 p-5 md:p-8 min-h-0 overflow-y-auto max-w-7xl">
              {props.children}
            </section>
          </div>
        </AppShell>
      </body>
    </html>
  );
}
