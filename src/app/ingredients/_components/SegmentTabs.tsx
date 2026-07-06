"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { INGREDIENT_TABS, TAB_LABEL } from "../_lib/types";

/**
 * 구매·보관·처리 세그먼트 탭. 탭 = URL 세그먼트(/ingredients/[slug]/[tab]).
 * 현재 경로로 active를 판단해 언더라인 표시.
 */
export function SegmentTabs({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex border-b border-border bg-card">
      {INGREDIENT_TABS.map((tab) => {
        const href = `/ingredients/${slug}/${tab}`;
        const active = pathname === href;
        return (
          <Link
            key={tab}
            href={href}
            aria-current={active ? "page" : undefined}
            className={[
              "relative flex-1 py-3 text-center text-[15px] font-bold transition-colors",
              active ? "text-foreground" : "text-jg-ink-mute",
            ].join(" ")}
          >
            {TAB_LABEL[tab]}
            {active && (
              <span className="absolute inset-x-[20%] -bottom-px h-[3px] rounded-t bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
