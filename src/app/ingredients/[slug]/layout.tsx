import { notFound } from "next/navigation";
import { getIngredientSlugs } from "../_lib/ingredients";
import { fetchIngredientMeta } from "../_lib/queries/ingredient-meta";
import { SegmentTabs } from "../_components/SegmentTabs";

/** 알려진 재료는 프리렌더, 그 외(API에만 있는 재료)는 요청 시 동적 생성. */
export function generateStaticParams() {
  return getIngredientSlugs().map((slug) => ({ slug }));
}
export const dynamicParams = true;

/**
 * 재료 상세 공통 셸.
 * 앱 공통 Header/TabBar는 루트 layout(src/app/layout.tsx)이 제공한다 —
 * 여기선 상세 전용 SegmentTabs(구매/보관/처리)만 얹는다(이중 헤더/탭바 방지).
 *
 * Header 바로 아래에 세그먼트 탭이 자연스럽게 이어지도록:
 * 루트 main의 상단 패딩(pt-5)·좌우 패딩(px-5)을 상쇄(-mt-5 -mx-5)해
 * 탭을 화면 폭 끝까지 붙이고 Header 밑선과 밀착시킨다.
 * 세그먼트 탭은 스크롤과 함께 올라간다(sticky 아님) — 상단 고정은 확률 게이지만.
 */
export default async function IngredientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // 존재 확인은 API로 (하드코딩 목록 아님) — API에만 있는 재료도 통과(peach 등).
  const meta = await fetchIngredientMeta(slug);
  if (!meta) notFound();

  return (
    <div className="flex flex-1 flex-col">
      {/* 세그먼트 탭 — Header 아래 밀착, 좌우 엣지까지. (sticky 아님 — 스크롤과 함께 올라감) */}
      <div className="-mx-5 -mt-5">
        <SegmentTabs slug={slug} />
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex flex-1 flex-col gap-4 pt-4">{children}</div>
    </div>
  );
}
