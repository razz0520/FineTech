import { apiFetch, type Lesson } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getLesson(lessonId: string): Promise<Lesson | null> {
  try {
    return await apiFetch<Lesson>(`/lms/lessons/${lessonId}`);
  } catch {
    return null;
  }
}

async function getQuizIdForLesson(lessonId: string): Promise<string | null> {
  try {
    const data = await apiFetch<{ id: string }>(`/lms/lessons/${lessonId}/quiz`);
    return data.id;
  } catch {
    return null;
  }
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const [lesson, quizId] = await Promise.all([getLesson(lessonId), getQuizIdForLesson(lessonId)]);
  if (!lesson) notFound();
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href={`/learn/${lesson.course_id}`}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to course
        </Link>
        <h2 className="text-xl font-semibold tracking-tight mt-2">{lesson.title}</h2>
        {lesson.estimated_minutes != null && (
          <p className="text-xs text-slate-500 mt-1">{lesson.estimated_minutes} min read</p>
        )}
      </div>
      <div
        className="prose prose-invert prose-sm max-w-none text-slate-200"
        dangerouslySetInnerHTML={{
          __html: lesson.content_rich_text || `<p>No content yet.</p>`,
        }}
      />
      <div className="flex gap-2">
        {quizId ? (
          <Link
            href={`/learn/quiz/${quizId}`}
            className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
          >
            Take quiz
          </Link>
        ) : null}
      </div>
    </div>
  );
}
