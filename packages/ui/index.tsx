import * as React from "react";

export interface ShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: ShellProps) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="ambient-glow">
        <div className="glow-1" />
        <div className="glow-2" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-slate-950/40 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gradient">
              {title}
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium leading-none mt-1">
              Intelligence Platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Terminal Status</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Operational</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full border border-white/10 bg-slate-800 flex items-center justify-center overflow-hidden hover:border-cyan-500/50 transition-colors cursor-pointer ring-offset-2 ring-offset-[#020617] hover:ring-2 ring-cyan-500/20">
            <div className="w-full h-full bg-gradient-to-b from-slate-700 to-slate-900" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex relative z-10">{children}</main>
    </div>
  );
}
