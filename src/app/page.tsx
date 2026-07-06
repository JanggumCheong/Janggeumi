import Link from "next/link";
import { apiUrl } from "@/lib/api";

async function getBackendStatus() {
  try {
    const response = await fetch(apiUrl("/health"), {
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

  // 공통 layout(src/app/layout.tsx)이 Header·TabBar·main 셸을 제공한다.
  // 여기선 셸 안 콘텐츠만 렌더한다(자체 main·header 중복 금지 → 상단 잘림 방지).
  return (
    <div className="flex flex-col gap-8">
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
    </div>
  );
}
