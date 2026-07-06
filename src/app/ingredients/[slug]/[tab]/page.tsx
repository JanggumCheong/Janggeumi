import { notFound } from "next/navigation";
import { getIngredient, getIngredientSlugs, isValidTab } from "../../_lib/ingredients";
import { INGREDIENT_TABS, TAB_LABEL } from "../../_lib/types";

/** slug × tab 조합을 정적 생성. */
export function generateStaticParams() {
  return getIngredientSlugs().flatMap((slug) => INGREDIENT_TABS.map((tab) => ({ slug, tab })));
}

/**
 * 탭별 콘텐츠 (구매·보관·처리).
 * 지금은 빈 레이아웃 — 자리표시만. 이후 탭별 섹션 컴포넌트를 여기서 분기 렌더.
 */
export default async function IngredientTabPage({
  params,
}: {
  params: Promise<{ slug: string; tab: string }>;
}) {
  const { slug, tab } = await params;
  const ingredient = getIngredient(slug);
  if (!ingredient || !isValidTab(tab)) notFound();

  // TODO: 탭별 섹션 컴포넌트로 분기
  //   purchase → <PurchaseSection data={ingredient.purchase} />
  //   storage  → <StorageSection data={ingredient.storage} />
  //   handling → <HandlingSection data={ingredient.handling} />
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-jg-ink-mute">
        {ingredient.name} · {TAB_LABEL[tab]} 탭 (레이아웃 자리표시)
      </p>

      <div className="rounded-[16px] border border-dashed border-border p-6 text-center text-sm text-jg-ink-sub">
        {TAB_LABEL[tab]} 콘텐츠가 들어갈 자리
      </div>
    </div>
  );
}
