import type { DisposeItem } from "../../_lib/types";
import { DisposeCard } from "./DisposeCard";

/**
 * 폐기 처리 목록 — 부위별 분리배출 안내를 카드에 담고 항목 사이 구분선.
 * 데이터가 없으면 안내(폐기 정보 미비 재료 대응).
 */
export function DisposeList({
  slug,
  items,
}: {
  slug: string;
  items: DisposeItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-[20px] border border-border bg-card p-8 text-center text-sm text-jg-ink-sub">
        아직 폐기·분리배출 안내가 준비 중이에요.
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-border bg-card p-2 shadow-[0_2px_10px_rgba(31,29,24,0.05)]">
      {items.map((item) => (
        <div
          key={item.key}
          className="px-2 not-first:border-t not-first:border-border"
        >
          <DisposeCard
            item={item}
            href={`/ingredients/${slug}/handling/dispose/${item.key}`}
          />
        </div>
      ))}
    </div>
  );
}
