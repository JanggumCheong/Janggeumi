import { getIngredient, getIngredientSlugs } from "../_lib/ingredients";
import { fetchIngredientMeta } from "../_lib/queries/ingredient-meta";
import { emojiFor, nameFor } from "../_lib/slug";
import { SegmentTabs } from "../_components/SegmentTabs";
import { RecentViewTracker } from "../_components/RecentViewTracker";

/** 알려진 재료는 프리렌더, 그 외(API에만 있는 재료)는 요청 시 동적 생성. */
export function generateStaticParams() {
  return getIngredientSlugs().map((slug) => ({ slug }));
}
export const dynamicParams = true;

/**
 * 로컬 목록에 없는 재료(apple 등)는 요청 시 렌더된다. 이때 존재 확인용
 * fetchIngredientMeta가 no-store(revalidate: 0) fetch를 호출하는데, 라우트가
 * 정적으로 시작하면 Next가 "static→dynamic at runtime" 에러를 던져 layout이
 * 500으로 죽는다(page의 notFound()에 도달 못 함). 이 라우트는 매 요청 API에
 * 의존하므로 처음부터 동적 렌더로 선언해 충돌을 없앤다.
 */
export const dynamic = "force-dynamic";

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
  const localIngredient = getIngredient(slug);
  // 로컬 상세가 있으면 API 없이 통과, 없으면 API 메타로 이름 조회(존재 판정은 아래 page가 함).
  // 존재 확인 notFound()는 layout이 아니라 page에서 부른다 —
  // layout이 notFound()를 부르면 재료 전용 not-found.tsx가 못 잡고 전역 404로 샌다.
  // API 실패는 이름만 slug 매핑으로 대체(셸은 떠야 page가 판정) — 실패로 layout이 500 나면 안 됨.
  let metaName: string | null = null;
  if (!localIngredient) {
    metaName = await fetchIngredientMeta(slug)
      .then((m) => m?.name ?? null)
      .catch(() => nameFor(slug));
  }
  const displayName = localIngredient?.name ?? metaName ?? undefined;

  return (
    <div className="flex flex-1 flex-col">
      {displayName && (
        <RecentViewTracker
          slug={slug}
          name={displayName}
          emoji={localIngredient?.emoji ?? emojiFor(slug)}
        />
      )}

      {/* 세그먼트 탭 — Header 아래 밀착, 좌우 엣지까지. (sticky 아님 — 스크롤과 함께 올라감) */}
      <div className="-mx-5 -mt-5">
        <SegmentTabs slug={slug} />
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex flex-1 flex-col gap-4 pt-4">{children}</div>
    </div>
  );
}
