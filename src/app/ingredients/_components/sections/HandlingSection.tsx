"use client";

import { useState } from "react";
import type { Handling } from "../../_lib/types";
import { HeroSpeaker } from "../HeroSpeaker";
import { HandlingSubSegment } from "../handling/HandlingSubSegment";
import { RecipeFeed } from "../handling/RecipeFeed";
import { DisposeList } from "../handling/DisposeList";
import { CreateCTA } from "../handling/CreateCTA";
import type { HandlingArea } from "../handling/area";

/**
 * 처리 탭 (확산형) — 활용(레시피) vs 폐기(분리배출) 두 고민을 세그먼트로 가름.
 *   ✅ HeroSpeaker (세 탭 공통 재사용)
 *   ✅ HandlingSubSegment (활용/폐기 전환, 상태 소유)
 *   ✅ RecipeFeed (정렬만, 카테고리 필터 없음) + CreateCTA(활용에서만)
 *   ✅ DisposeList (분리배출 안내)
 *
 * 영역 선택(area)만 이 컨테이너가 들고, 각 영역은 자기 데이터만 렌더.
 * dispose 데이터가 없으면 세그먼트를 감추고 활용만 보여준다(데이터 없는 UI 없음).
 *
 * SEO/GEO: 활용·폐기 콘텐츠를 둘 다 DOM에 렌더한다(조건부로 한쪽을 빼면 크롤러/AI가
 * 폐기 분리배출 정보를 수집 못 함 — 보관 탭 '접어도 DOM 유지'와 같은 원칙).
 * 표준 탭 패턴(role=tabpanel + aria-hidden + hidden)이라 클로킹이 아님:
 * 봇과 사용자가 같은 HTML을 받고 사용자는 탭으로 접근 가능.
 */
export function HandlingSection({
  slug,
  ingredientName,
  data,
}: {
  slug: string;
  ingredientName: string;
  data: Handling;
}) {
  const [area, setArea] = useState<HandlingArea>("recipe");
  const hasDispose = (data.dispose?.length ?? 0) > 0;
  const current = hasDispose ? area : "recipe";

  const recipeInactive = current !== "recipe";
  const disposeInactive = current !== "dispose";

  return (
    <div className="flex flex-col gap-4">
      <HeroSpeaker
        seoTitle={`${ingredientName} 활용법·폐기 분리배출`}
        copy={
          <>
            남은 {ingredientName}
            <br />
            이렇게 처리하는 것이옵니다
          </>
        }
        sub="먹고 남았는지, 다 쓰고 버릴 차례인지"
      />

      {/* 폐기 데이터가 있을 때만 갈림길 노출 */}
      {hasDispose && (
        <HandlingSubSegment value={current} onChange={(next) => setArea(next)} />
      )}

      {/* 활용: 비활성이어도 DOM 유지(SEO). CTA도 활용 영역에 묶어 함께 전환. */}
      <div
        role="tabpanel"
        id="handling-panel-recipe"
        aria-labelledby="handling-tab-recipe"
        aria-hidden={recipeInactive}
        hidden={recipeInactive}
        className="flex flex-col gap-4"
      >
        <RecipeFeed slug={slug} recipes={data.recipes} />
        <CreateCTA ingredientName={ingredientName} />
      </div>

      {/* 폐기: 데이터 있을 때만. 비활성이어도 DOM 유지(SEO). */}
      {hasDispose && (
        <div
          role="tabpanel"
          id="handling-panel-dispose"
          aria-labelledby="handling-tab-dispose"
          aria-hidden={disposeInactive}
          hidden={disposeInactive}
        >
          <DisposeList slug={slug} items={data.dispose ?? []} />
        </div>
      )}
    </div>
  );
}
