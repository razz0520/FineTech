import * as React from "react";

export interface ShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: ShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <span className="text-xs text-slate-400">Finetech Platform</span>
      </header>
      <main className="flex-1 flex">{children}</main>
    </div>
  );
}

