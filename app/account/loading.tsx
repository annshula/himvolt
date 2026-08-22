export default function AccountLoading() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pt-16 pb-24 sm:px-8">
      <div className="h-4 w-40 animate-pulse rounded-full bg-line" />
      <div className="mt-6 h-10 w-64 animate-pulse rounded-full bg-line" />
      <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded-full bg-line" />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-line/70" />
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-line/70" />
      </div>
    </div>
  );
}
