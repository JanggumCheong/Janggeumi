import type { StorageMethod } from "../../_lib/types";
import { MethodCard } from "./MethodCard";

/**
 * 필터링된 보관 방법 목록. 카드 컨테이너에 담고 항목 사이 구분선.
 * 순위는 목록 인덱스(추천/별점 정렬은 데이터 순서를 신뢰 — 정렬 로직은 추후).
 * 필터 결과가 0개면 안내.
 */
export function MethodList({
  slug,
  methods,
}: {
  slug: string;
  methods: StorageMethod[];
}) {
  if (methods.length === 0) {
    return (
      <div className="rounded-[20px] border border-border bg-card p-8 text-center text-sm text-jg-ink-sub">
        조건에 맞는 보관 방법이 없어요. 필터를 바꿔보세요.
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-border bg-card p-2 shadow-[0_2px_10px_rgba(31,29,24,0.05)]">
      {methods.map((m, i) => (
        <div
          key={m.id}
          className="px-2 not-first:border-t not-first:border-border"
        >
          <MethodCard
            method={m}
            rank={i + 1}
            thumbEmoji={thumbFor(m)}
            href={`/ingredients/${slug}/storage/methods/${m.id}`}
          />
        </div>
      ))}
    </div>
  );
}

/** 방법 tags(장소/상태) → 썸네일 자리표시 이모지 (사진 확보 전). */
function thumbFor(m: StorageMethod): string {
  const place = m.tags.place;
  if (place === "냉동") return "🧊";
  if (place === "냉장") return "❄️";
  if (place === "실온") return "🌡️";
  return "📦";
}
