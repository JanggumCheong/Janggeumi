import Link from "next/link";

export default function SearchPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">검색</h1>
        <Link className="text-sm font-medium underline" href="/">
          홈
        </Link>
      </header>

      <section className="flex flex-col gap-4">
        <label className="text-sm font-medium" htmlFor="ingredient-search">
          재료 검색
        </label>
        <input
          className="rounded-md border border-foreground/20 bg-background px-4 py-3 outline-none"
          id="ingredient-search"
          placeholder="예: 수박, 감자, 대파"
          type="search"
        />
      </section>
    </main>
  );
}
