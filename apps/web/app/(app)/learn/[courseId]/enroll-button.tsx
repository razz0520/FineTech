"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";

export function EnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const enroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/lms/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": DEV_USER_ID },
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={enroll}
      disabled={loading}
      className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? "Enrolling…" : "Enroll"}
    </button>
  );
}
