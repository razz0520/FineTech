import { apiFetch, type Course, type Lesson, type Enrollment } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "./enroll-button";

async function getCourse(courseId: string): Promise<Course | null> {
  try {
    return await apiFetch<Course>(`/lms/courses/${courseId}`);
  } catch {
    return null;
  }
}

async function getLessons(courseId: string): Promise<Lesson[]> {
  try {
    return await apiFetch<Lesson[]>(`/lms/courses/${courseId}/lessons`);
  } catch {
    return [];
  }
}

async function getEnrollments(): Promise<Enrollment[]> {
  try {
    return await apiFetch<Enrollment[]>("/lms/me/enrollments");
  } catch {
    return [];
  }
}

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const [course, lessons, enrollments] = await Promise.all([
    getCourse(courseId),
    getLessons(courseId),
    getEnrollments(),
  ]);
  if (!course) notFound();
  const enrolled = enrollments.some((e) => e.course_id === courseId);
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{course.title}</h2>
          <p className="text-sm text-slate-300 mt-1">{course.description || "—"}</p>
          <p className="text-xs text-slate-500 capitalize mt-1">{course.difficulty}</p>
        </div>
        {!enrolled && <EnrollButton courseId={courseId} />}
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Lessons</h3>
        <ul className="space-y-2">
          {lessons.length === 0 ? (
            <li className="text-sm text-slate-400">No lessons in this course yet.</li>
          ) : (
            lessons.map((l, i) => (
              <li key={l.id}>
                <Link
                  href={`/learn/lesson/${l.id}`}
                  className="flex items-center gap-2 rounded border border-slate-800 p-3 hover:bg-slate-800/50"
                >
                  <span className="text-slate-500 w-6">{i + 1}</span>
                  <span className="flex-1">{l.title}</span>
                  {l.estimated_minutes != null && (
                    <span className="text-xs text-slate-500">{l.estimated_minutes} min</span>
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
