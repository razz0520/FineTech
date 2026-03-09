import { apiFetch, type Course } from "@/lib/api";
import Link from "next/link";

async function getCourses(): Promise<Course[]> {
  try {
    return await apiFetch<Course[]>("/lms/courses");
  } catch {
    return [];
  }
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "badge-beginner",
  intermediate: "badge-intermediate",
  advanced: "badge-advanced",
};

export default async function LearnPage() {
  const courses = await getCourses();
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Course Catalog</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1.5">
          Browse courses and track your progress with quizzes and badges.
        </p>
      </div>

      {/* Course grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {courses.length === 0 ? (
          <div className="col-span-full glass-card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-slate-300 font-medium mb-1">No courses yet</p>
            <p className="text-xs text-slate-500">Courses will appear here once seeded via the API.</p>
          </div>
        ) : (
          courses.map((c) => (
            <Link
              key={c.id}
              href={`/learn/${c.id}`}
              className="glass-card gradient-border p-5 block group hover:translate-y-[-2px] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-cyan-400" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <span className={`badge ${DIFFICULTY_COLORS[c.difficulty] || "badge-beginner"}`}>
                  {c.difficulty}
                </span>
              </div>
              <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors mb-1.5">
                {c.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {c.description || "—"}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
