import * as React from "react";

export interface ShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: ShellProps) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-violet-500/3 rounded-full blur-3xl" />
      </div>

      {/* Top accent gradient line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500 relative z-10 shrink-0" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-6 py-3.5 flex items-center justify-between backdrop-blur-sm bg-slate-950/50 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="gradient-text">{title}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">Financial Intelligence</span>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex relative z-10">{children}</main>
    </div>
  );
}
