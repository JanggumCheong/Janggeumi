import { notFound } from "next/navigation";
import { getIngredientDetail, getIngredientSlugs, isValidTab } from "../../_lib/ingredients";
import { INGREDIENT_TABS } from "../../_lib/types";
import { PurchaseSection } from "../../_components/sections/PurchaseSection";
import { StorageSection } from "../../_components/sections/StorageSection";
import { HandlingSection } from "../../_components/sections/HandlingSection";

/** 알려진 slug × tab 은 프리렌더, 그 외(API에만 있는 재료)는 요청 시 동적 생성. */
export function generateStaticParams() {
  return getIngredientSlugs().flatMap((slug) => INGREDIENT_TABS.map((tab) => ({ slug, tab })));
}
export const dynamicParams = true;

/**
 * 탭별 콘텐츠 (구매·보관·처리).
 * 탭마다 성격이 다르므로 섹션 컴포넌트로 분기한다(같은 카드 3개 금지).
 * 각 섹션은 해당 데이터만 props로 받아 렌더 — 데이터가 바뀌어도 섹션만 수정.
 */
export default async function IngredientTabPage({
  params,
}: {
  params: Promise<{ slug: string; tab: string }>;
}) {
  const { slug, tab } = await params;
  const ingredient = await getIngredientDetail(slug);
  if (!ingredient || !isValidTab(tab)) notFound();

  return (
    <>
      {tab === "purchase" && (
        <PurchaseSection ingredientName={ingredient.name} data={ingredient.purchase} />
      )}
      {tab === "storage" && (
        <StorageSection slug={slug} ingredientName={ingredient.name} data={ingredient.storage} />
      )}
      {tab === "handling" && (
        <HandlingSection slug={slug} ingredientName={ingredient.name} data={ingredient.handling} />
      )}
    </>
  );
}
