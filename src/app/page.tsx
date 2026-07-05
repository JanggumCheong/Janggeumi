import Link from "next/link";

async function getBackendStatus() {
  try {
    const response = await fetch("http://127.0.0.1:8000/health", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Backend health check failed");
    }

    return await response.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const backendStatus = await getBackendStatus();

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

      <section className="rounded-lg border border-black/10 p-4">
        <h3 className="text-lg font-semibold">백엔드 연결 상태</h3>
        <p className="mt-2 text-sm text-foreground/70">
          {backendStatus ? (
            <span className="text-green-600">연결됨: {backendStatus.status}</span>
          ) : (
            <span className="text-red-600">연결되지 않음. 백엔드 서버를 먼저 실행하세요.</span>
          )}
        </p>
      </section>
    </main>
  );
}
