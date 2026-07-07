import Link from "next/link";
import type { DisposeItem } from "../../_lib/types";

/**
 * 폐기 처리 안내 하나 — 아이콘 + 부위명 + 배출 방법 + 배출 유형 배지.
 * wasteType은 3종(음식물/일반/재활용). 배지 색으로 구분(음식물=초록, 그 외 무채색).
 * 카드 전체가 Link(분리배출 상세 — 지자체 차이·근거·오분류 안내. 지금은 준비중 #).
 * 카드의 way는 '요약 한 줄', 상세는 별도 페이지에서 깊게 다룬다.
 */
const WASTE_LABEL: Record<DisposeItem["wasteType"], string> = {
  food: "음식물 쓰레기",
  general: "일반 쓰레기",
  recycle: "재활용",
};

const WASTE_ICON: Record<string, string> = {
  rind: "🍉",
  seed: "🌰",
  wrap: "🕸",
  skin: "🥔",
  root: "🌿",
  leaf: "🥬",
};

export function DisposeCard({
  item,
  href = "#",
}: {
  item: DisposeItem;
  /** 분리배출 상세 링크 (미정 시 #). */
  href?: string;
}) {
  const food = item.wasteType === "food";

  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-[16px] py-3.5 transition-colors hover:bg-black/[0.015]"
    >
      <div className="flex size-11 flex-none items-center justify-center rounded-[16px] bg-jg-use-bg text-[22px]">
        <span aria-hidden>{WASTE_ICON[item.key] ?? "🗑"}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">{item.title}</div>
        <p className="mt-0.5 text-xs leading-[1.45] text-jg-ink-sub">{item.way}</p>
        <span
          className={[
            "mt-1.5 inline-block rounded-[10px] px-2 py-0.5 text-[11px] font-bold",
            food ? "bg-jg-buy-bg text-jg-buy" : "bg-muted text-jg-ink-sub",
          ].join(" ")}
        >
          {WASTE_LABEL[item.wasteType]}
        </span>
      </div>
    </Link>
  );
}
