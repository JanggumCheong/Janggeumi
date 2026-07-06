import { notFound } from "next/navigation";
import {
  getIngredient,
  getIngredientSlugs,
  isValidTab,
} from "../../_lib/ingredients";
import { INGREDIENT_TABS } from "../../_lib/types";
import { PurchaseSection } from "../../_components/sections/PurchaseSection";

/** slug × tab 조합을 정적 생성. */
export function generateStaticParams() {
  return getIngredientSlugs().flatMap((slug) =>
    INGREDIENT_TABS.map((tab) => ({ slug, tab })),
  );
}

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
  const ingredient = getIngredient(slug);
  if (!ingredient || !isValidTab(tab)) notFound();

  return (
    <>
      {tab === "purchase" && (
        <PurchaseSection
          ingredientName={ingredient.name}
          emoji={ingredient.emoji}
          data={ingredient.purchase}
        />
      )}
      {tab === "storage" && <Placeholder label="보관" />}
      {tab === "handling" && <Placeholder label="처리" />}
    </>
  );
}

/** 아직 구현 안 된 탭 자리표시 (구매 완성 후 하나씩 교체). */
function Placeholder({ label }: { label: string }) {
  return (
    <div className="rounded-[16px] border border-dashed border-border p-6 text-center text-sm text-jg-ink-sub">
      {label} 콘텐츠가 들어갈 자리
    </div>
  );
}
