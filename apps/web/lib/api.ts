const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";

export function apiUrl(path: string): string {
  return `${API_BASE}/api${path}`;
}

export async function apiFetch<T>(
  path: string,
  options?: Omit<RequestInit, "headers"> & { headers?: Record<string, string> }
): Promise<T> {
  const url = apiUrl(path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Id": DEV_USER_ID,
    ...options?.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json() as Promise<T>;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  tags: string[] | null;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_rich_text: string | null;
  order: number;
  estimated_minutes: number | null;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}
