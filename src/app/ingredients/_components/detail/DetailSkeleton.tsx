export function DetailSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="상세 화면을 불러오는 중"
      className="flex animate-pulse flex-col gap-4 pb-4"
    >
      <section className="relative overflow-hidden rounded-[24px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(31,29,24,0.05)]">
        <div className="absolute -right-10 top-10 size-44 rounded-full bg-muted" />
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="h-3 w-32 rounded-full bg-muted" />
            <div className="flex gap-2">
              <div className="size-8 rounded-full bg-muted" />
              <div className="size-8 rounded-full bg-muted" />
            </div>
          </div>

          <div className="h-6 w-12 rounded-full bg-muted" />
          <div className="mt-4 h-8 w-48 rounded-full bg-muted" />
          <div className="mt-2 h-8 w-36 rounded-full bg-muted" />
          <div className="mt-3 h-4 w-24 rounded-full bg-muted" />

          <div className="mt-4 flex flex-wrap gap-1.5">
            <div className="h-6 w-14 rounded-full bg-muted" />
            <div className="h-6 w-16 rounded-full bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>

          <div className="mt-8 flex items-end justify-between gap-3">
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-full rounded-full bg-muted" />
              <div className="h-4 w-4/5 rounded-full bg-muted" />
            </div>
            <div className="size-32 flex-none rounded-[28px] bg-muted" />
          </div>
        </div>
      </section>

      <SkeletonCard lines={5} />
      <SkeletonCard lines={4} hasMedia />
      <SkeletonCard lines={3} />
      <SkeletonList />
    </article>
  );
}

function SkeletonCard({ lines, hasMedia = false }: { lines: number; hasMedia?: boolean }) {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <div className="h-5 w-32 rounded-full bg-muted" />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            {hasMedia && index < 2 && <div className="size-14 flex-none rounded-[16px] bg-muted" />}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-full rounded-full bg-muted" />
              <div className="h-3 w-2/3 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SkeletonList() {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <div className="h-5 w-40 rounded-full bg-muted" />
      <div className="mt-3 flex flex-col divide-y divide-border">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="size-12 flex-none rounded-[14px] bg-muted" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-4/5 rounded-full bg-muted" />
              <div className="h-3 w-1/2 rounded-full bg-muted" />
            </div>
            <div className="size-4 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
