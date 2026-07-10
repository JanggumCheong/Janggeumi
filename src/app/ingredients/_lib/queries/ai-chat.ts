/**
 * 없는 재료 발화 쿼리 — POST /api/ai/chat 로 장금이 즉석 안내(answer)를 받는다.
 *
 * POST지만 의미는 "조회"다(같은 재료 → 같은 안내, 서버 상태 안 바꿈) → useQuery로 감싼다.
 * 캐싱으로 같은 재료 재진입 시 재호출을 막아 LLM 비용·지연을 아낀다(기획의 무분별 호출 방지).
 */
import { queryOptions } from "@tanstack/react-query";
import { apiUrl } from "@/lib/api";

async function fetchAiChat(slug: string): Promise<string> {
  const res = await fetch(apiUrl("/api/ai/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // API가 영문 slug도 재료로 이해한다(carrot→당근). 그대로 넘긴다.
    body: JSON.stringify({ message: slug }),
  });
  if (!res.ok) throw new Error(`ai/chat ${res.status}`);
  const json = (await res.json()) as { answer?: string };
  if (!json.answer) throw new Error("empty answer");
  return json.answer;
}

/** slug별 발화 쿼리 옵션. answer는 재료마다 고정적이라 오래 캐싱한다. */
export function aiChatQuery(slug: string) {
  return queryOptions({
    queryKey: ["ai-chat", slug],
    queryFn: () => fetchAiChat(slug),
    staleTime: 60 * 60 * 1000, // 1시간 — 같은 재료 재진입 시 재호출 안 함
    retry: 1, // LLM 순간 오류엔 1회 재시도, 그 이상은 에러 UI로
    enabled: slug.length > 0,
  });
}
