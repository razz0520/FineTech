import Link from "next/link";
import { API_BASE, type Course } from "@/lib/api";
import { mockCourses } from "@/lib/mock-data";
import { StrategicRealityCheck } from "@/components/reality-check";

async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${API_BASE}/api/lms/courses`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return mockCourses();
  }
}

const DIFFICULTY_MAP: Record<string, { label: string; class: string }> = {
  beginner: { label: "[BASE-LEVEL HYGIENE]", class: "badge-beginner" },
  intermediate: { label: "[CORE OPERATIONAL]", class: "badge-intermediate" },
  advanced: { label: "[PROFESSIONAL MASTERY]", class: "badge-advanced" },
};

export default async function LearnPage() {
  const courses = await getCourses();
  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
          [INIT] Curriculum Catalog
        </h2>
        <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">
          Operational knowledge ingestion modules for 12 LPA professional target.
        </p>
      </div>

      {/* Course grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {courses.length === 0 ? (
          <div className="col-span-full glass-card p-10 text-center border-dashed border-rose-500/20">
            <p className="text-rose-400 font-bold uppercase tracking-widest mb-1">
              [ERROR] NO MODULES FOUND
            </p>
            <p className="text-[10px] text-slate-500 uppercase">
              Operational failure: Seed the API to populate curriculum database.
            </p>
          </div>
        ) : (
          courses.map((c) => {
            const diff = DIFFICULTY_MAP[c.difficulty] || DIFFICULTY_MAP.beginner;
            return (
              <Link
                key={c.id}
                href={`/learn/${c.id}`}
                className={`glass-card gradient-border p-5 block group hover:translate-y-[-2px] transition-all duration-300 ${c.difficulty === "advanced" ? "border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="text-slate-400"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${diff.class}`}
                  >
                    {diff.label}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors mb-2 uppercase tracking-tight">
                  {c.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans italic">
                  {c.description || "—"}
                </p>
                {c.difficulty === "advanced" && (
                  <div className="mt-4 pt-3 border-t border-cyan-500/20">
                    <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.1em]">
                      [PRIORITY] REQUIRED FOR 12 LPA TARGET
                    </p>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>

      <StrategicRealityCheck />
    </div>
  );
}
