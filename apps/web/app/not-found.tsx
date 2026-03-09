export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-xl font-semibold text-slate-300">404 — Not found</h2>
      <p className="text-sm text-slate-400">The page you're looking for doesn't exist.</p>
      <a
        href="/dashboard"
        className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
