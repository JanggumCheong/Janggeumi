import Link from "next/link";

type IngredientPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function IngredientPage({ params }: IngredientPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">재료 상세</h1>
        <Link className="text-sm font-medium underline" href="/search">
          검색
        </Link>
      </header>

      <section className="flex flex-col gap-4">
        <p className="text-sm text-foreground/60">slug: {slug}</p>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-md border border-foreground/15 p-4">
            <h2 className="font-semibold">구매</h2>
            <p className="mt-2 text-sm text-foreground/70">좋은 재료를 고르는 기준 영역입니다.</p>
          </article>
          <article className="rounded-md border border-foreground/15 p-4">
            <h2 className="font-semibold">보관</h2>
            <p className="mt-2 text-sm text-foreground/70">상태별 보관 방법을 보여줄 영역입니다.</p>
          </article>
          <article className="rounded-md border border-foreground/15 p-4">
            <h2 className="font-semibold">처리</h2>
            <p className="mt-2 text-sm text-foreground/70">
              남은 재료 활용 방법을 보여줄 영역입니다.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
