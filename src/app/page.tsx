import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Janggeumi</h1>
        <Link className="text-sm font-medium underline" href="/search">
          검색
        </Link>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">홈</h2>
        <p className="text-foreground/70">
          식재료 구매, 보관, 처리 정보를 탐색하는 시작 화면입니다.
        </p>
        <Link className="font-medium underline" href="/ingredients/watermelon">
          재료 상세 예시 보기
        </Link>
      </section>
    </main>
  );
}
