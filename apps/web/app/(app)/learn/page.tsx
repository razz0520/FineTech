import { apiFetch, type Course } from "@/lib/api";
import Link from "next/link";

async function getCourses(): Promise<Course[]> {
  try {
    return await apiFetch<Course[]>("/lms/courses");
  } catch {
    return [];
  }
}

export default async function LearnPage() {
  const courses = await getCourses();
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Course catalog</h2>
      <p className="text-sm text-slate-300">
        Browse courses and track your progress with quizzes and badges.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? (
          <p className="text-sm text-slate-400 col-span-full">
            No courses yet. Seed data via API or admin.
          </p>
        ) : (
          courses.map((c) => (
            <Link
              key={c.id}
              href={`/learn/${c.id}`}
              className="block rounded-lg border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-600 transition-colors"
            >
              <h3 className="font-medium mb-1">{c.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{c.description || "—"}</p>
              <span className="inline-block mt-2 text-xs text-slate-500 capitalize">
                {c.difficulty}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
