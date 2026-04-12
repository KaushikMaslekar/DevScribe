export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-14 md:px-10">
      <div className="h-9 w-52 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-5 w-80 animate-pulse rounded bg-muted" />

      <section className="mt-8 rounded-xl border bg-card p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-muted" />
        <div className="mt-3 h-10 w-full animate-pulse rounded bg-muted" />
        <div className="mt-4 h-72 w-full animate-pulse rounded bg-muted" />
      </section>
    </main>
  );
}
