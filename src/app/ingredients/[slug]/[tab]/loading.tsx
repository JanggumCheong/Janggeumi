"use client";

import { useParams } from "next/navigation";
import { TabSkeleton } from "../../_components/detail/TabSkeleton";
import { INGREDIENT_TABS, type IngredientTab } from "../../_lib/types";

/**
 * 탭 콘텐츠 로딩 fallback.
 * page(IngredientTabPage)는 진입·탭 전환마다 API 3종(구매·보관·처리)을 no-store로
 * await 한다 — 그동안 RSC 응답이 블로킹돼 화면이 멈춘 것처럼 보였다.
 * loading.tsx를 [tab] 세그먼트에 두면 layout의 SegmentTabs(탭 바)는 유지된 채
 * page 데이터가 오는 동안 이 스켈레톤만 스트리밍된다 — 탭 전환이 즉각 반응.
 *
 * loading.tsx는 props(params)를 받지 못하므로(Next 규약) 클라이언트에서 useParams로
 * tab을 읽어 탭별 스켈레톤을 그린다(탭마다 레이아웃이 완전히 다름 — TabSkeleton 참고).
 */
export default function Loading() {
  const params = useParams<{ tab: string }>();
  const tab: IngredientTab = INGREDIENT_TABS.includes(params.tab as IngredientTab)
    ? (params.tab as IngredientTab)
    : "purchase";
  return <TabSkeleton tab={tab} />;
}
