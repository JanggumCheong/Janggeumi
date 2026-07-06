import { notFound } from "next/navigation";
import { getIngredient, getIngredientSlugs } from "../_lib/ingredients";
import { AppBar } from "../_components/AppBar";
import { SegmentTabs } from "../_components/SegmentTabs";
import { BottomTabBar } from "../_components/BottomTabBar";

/** 존재하는 재료만 정적 생성. */
export function generateStaticParams() {
  return getIngredientSlugs().map((slug) => ({ slug }));
}

/**
 * 재료 상세 공통 셸 (모바일 우선).
 * 앱바 + 세그먼트 탭 + [탭 콘텐츠] + 하단 탭바. 탭이 바뀌어도 이 셸은 유지된다.
 *
 * 데스크탑 확장 여지: 지금은 폰 폭(max-w-md) 중앙 정렬.
 * 나중에 breakpoint(md:)로 좌 사이드바 + 우 요약 패널을 얹을 수 있게 구조를 열어둔다.
 */
export default async function IngredientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ingredient = getIngredient(slug);
  if (!ingredient) notFound();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      {/* 상단 고정: 앱바 + 세그먼트 탭 */}
      <div className="sticky top-0 z-20">
        <AppBar title={ingredient.name} />
        <SegmentTabs slug={slug} />
      </div>

      {/* 탭 콘텐츠 (스크롤 영역) */}
      <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>

      {/* 하단 탭바 */}
      <BottomTabBar active="ingredients" />
    </div>
  );
}
