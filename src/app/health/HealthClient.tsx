"use client";

/**
 * 백엔드 헬스 체크 — TanStack Query로 실시간 조회.
 * 로컬/배포 분기(API_BASE_URL)가 실제로 어디를 보는지 함께 노출한다.
 */

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, apiUrl } from "@/lib/api";

async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(apiUrl("/health"), { cache: "no-store" });
  if (!res.ok) throw new Error(`health ${res.status}`);
  return res.json();
}

export function HealthClient() {
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: false,
    staleTime: 0,
  });

  const ok = !!data && !error;

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-black/10 p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`inline-block size-2.5 rounded-full ${
            isFetching
              ? "bg-jg-star"
              : ok
                ? "bg-jg-primary-strong"
                : "bg-destructive"
          }`}
        />
        <span className="text-sm font-bold text-jg-primary-strong">
          {isFetching ? "확인 중…" : ok ? "연결됨" : "연결 안 됨"}
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-jg-ink-sub">
        <dt className="font-semibold">API Base</dt>
        <dd className="break-all font-mono">{API_BASE_URL}</dd>
        <dt className="font-semibold">응답</dt>
        <dd className="font-mono">
          {ok ? JSON.stringify(data) : error ? String(error) : "—"}
        </dd>
      </dl>

      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        className="self-start rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
      >
        다시 확인
      </button>
    </div>
  );
}
