"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold text-rose-400">Something went wrong</h2>
          <p className="text-sm text-slate-400 max-w-md text-center">{error.message}</p>
          <button
            onClick={reset}
            className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
