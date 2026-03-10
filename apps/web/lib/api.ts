export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";

export function apiUrl(path: string): string {
  return `${API_BASE}/api${path}`;
}

export async function apiFetch<T>(
  path: string,
  options?: Omit<RequestInit, "headers"> & { headers?: Record<string, string> },
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

/**
 * Tries the real API first; on any failure falls back to the provided mock data.
 * This ensures the UI always renders with data even when the backend is down.
 */
export async function safeFetch<T>(
  path: string,
  fallback: T,
  options?: Omit<RequestInit, "headers"> & { headers?: Record<string, string> },
): Promise<T> {
  try {
    return await apiFetch<T>(path, options);
  } catch {
    return fallback;
  }
}

/**
 * POST variant of safeFetch — tries the API then falls back.
 */
export async function safePost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  try {
    return await apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return fallback;
  }
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
