"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { INGREDIENT_TABS, TAB_LABEL, type IngredientTab } from "../_lib/types";

/**
 * 구매·보관·처리 세그먼트 탭. 탭 = URL 세그먼트(/ingredients/[slug]/[tab]).
 * 현재 경로로 active를 판단해 언더라인 표시.
 *
 * 활성 탭 색 = 영역별 액센트(구매 초록·보관 청록·처리 주황) — 브랜드 초록 고정 아님.
 * 하위 세그먼트(활용/폐기 주황)와 정체성 일치, "지금 어느 영역"이 색으로 즉시 읽힘.
 * 비활성은 웜그레이로 절제(영역색은 활성일 때만). design-system 8-0.
 *
 * Tailwind는 클래스명을 정적 분석하므로 영역색을 완전한 클래스 문자열로 매핑한다
 * (동적 조합 `text-jg-${x}` 금지 — purge됨).
 */
const TAB_ACCENT: Record<IngredientTab, { text: string; bar: string }> = {
  purchase: { text: "text-jg-buy", bar: "bg-jg-buy" },
  storage: { text: "text-jg-keep", bar: "bg-jg-keep" },
  handling: { text: "text-jg-use", bar: "bg-jg-use" },
};

export function SegmentTabs({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex border-b border-border bg-card">
      {INGREDIENT_TABS.map((tab) => {
        const href = `/ingredients/${slug}/${tab}`;
        const active = pathname === href;
        const accent = TAB_ACCENT[tab];
        return (
          <Link
            key={tab}
            href={href}
            replace
            aria-current={active ? "page" : undefined}
            className={[
              "relative flex-1 py-3 text-center text-[15px] transition-colors",
              active ? `font-extrabold ${accent.text}` : "font-bold text-jg-ink-mute",
            ].join(" ")}
          >
            {TAB_LABEL[tab]}
            {active && (
              <span
                className={`absolute inset-x-[20%] -bottom-px h-0.75 rounded-t ${accent.bar}`}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
