"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";

interface QuizQuestion {
  id: string;
  type: string;
  prompt: string;
  metadata_json: Record<string, unknown> | null;
  answers: { id: string; text: string; is_correct: boolean; explanation: string | null }[];
}

interface QuizData {
  id: string;
  lesson_id: string;
  title: string;
  config: Record<string, unknown> | null;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{
    score: number;
    passed: boolean;
    correct: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/lms/quizzes/${quizId}`, {
      headers: { "X-User-Id": DEV_USER_ID },
    })
      .then((r) => r.json())
      .then(setQuiz)
      .catch(() => setQuiz(null))
      .finally(() => setLoading(false));
  }, [quizId]);

  const submit = async () => {
    if (!quiz) return;
    const attempt_data: Record<string, unknown> = {};
    const answersPayload = quiz.questions.map((q) => ({
      question_id: q.id,
      answer_id: answers[q.id] || "",
    }));
    const res = await fetch(`${API_BASE}/api/lms/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": DEV_USER_ID,
      },
      body: JSON.stringify({ attempt_data, answers: answersPayload }),
    });
    const data = await res.json();
    setSubmitted({
      score: data.score,
      passed: data.passed,
      correct: data.correct,
      total: data.total,
    });
  };

  if (loading || !quiz) {
    return (
      <div className="space-y-4">
        <p className="text-slate-400">{loading ? "Loading…" : "Quiz not found."}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-4 max-w-xl">
        <h2 className="text-xl font-semibold">{quiz.title}</h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-lg">
            Score: {Math.round(submitted.score * 100)}% ({submitted.correct}/{submitted.total})
          </p>
          <p className={submitted.passed ? "text-emerald-400" : "text-amber-400"}>
            {submitted.passed ? "Passed" : "Not passed"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/learn/lesson/${quiz.lesson_id}`)}
          className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          Back to lesson
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">{quiz.title}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-6"
      >
        {quiz.questions.map((q) => (
          <div key={q.id} className="rounded-lg border border-slate-800 p-4">
            <p className="font-medium mb-2">{q.prompt}</p>
            <div className="space-y-2">
              {q.answers.map((a) => (
                <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={q.id}
                    value={a.id}
                    checked={answers[q.id] === a.id}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: a.id }))}
                    className="rounded border-slate-600"
                  />
                  <span>{a.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Submit quiz
        </button>
      </form>
    </div>
  );
}
