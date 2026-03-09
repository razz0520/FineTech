"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-xl font-semibold text-rose-400">Something went wrong</h2>
      <p className="text-sm text-slate-400 max-w-md text-center">{error.message}</p>
      <button
        onClick={reset}
        className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
      >
        Try again
      </button>
    </div>
  );
}
