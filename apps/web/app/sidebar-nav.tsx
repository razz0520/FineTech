"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-context";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/learn",
    label: "Learn",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="13" y2="11" />
      </svg>
    ),
  },
  {
    href: "/playground",
    label: "Playground",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    href: "/advisor",
    label: "AI Advisor",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z" />
        <line x1="10" y1="22" x2="14" y2="22" />
      </svg>
    ),
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="p-4 space-y-2 flex-1 flex flex-col font-sans">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">
        Intelligence Nodes
      </p>
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                transition-all duration-300 relative overflow-hidden
                ${
                  isActive
                    ? "bg-white/[0.04] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
              )}
              <span
                className={`${isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" : "text-slate-500 group-hover:text-slate-400"} transition-all duration-300`}
              >
                {item.icon}
              </span>
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-50" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Auth section */}
      {isAuthenticated && user ? (
        <div className="p-2 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center text-sm font-bold text-cyan-400 uppercase ring-1 ring-white/10 shadow-lg shadow-cyan-500/10">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-100 truncate tracking-tight">
                {user.name}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Active
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-300 w-full group"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:rotate-12 transition-transform"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Disconnect</span>
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-all duration-200"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Sign in</span>
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all duration-200"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Create account</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
