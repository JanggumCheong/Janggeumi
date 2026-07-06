"use client";

import { useState } from "react";
import type { Recipe } from "../../_lib/types";
import { RecipeSort } from "./RecipeSort";
import { RecipeCard } from "./RecipeCard";
import { sortRecipes, type RecipeSortKey } from "./recipe-sort";

/**
 * 활용 처리 — 레시피 UGC 피드 (H2: 카테고리 필터 없이 정렬만).
 * 정렬 선택(draft)을 소유하고, 정렬은 순수 함수로. 확산형이라 목록이 주인공.
 */
export function RecipeFeed({ recipes }: { recipes: Recipe[] }) {
  const [sort, setSort] = useState<RecipeSortKey>("popular");
  const visible = sortRecipes(recipes, sort);

  if (recipes.length === 0) {
    return (
      <div className="rounded-[20px] border border-border bg-card p-8 text-center text-sm text-jg-ink-sub">
        아직 등록된 활용법이 없어요. 첫 번째 레시피를 공유해 주세요!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <RecipeSort
        count={recipes.length}
        value={sort}
        onChange={(next) => setSort(next)}
      />

      <div className="rounded-[20px] border border-border bg-card p-2 shadow-[0_2px_10px_rgba(31,29,24,0.05)]">
        {visible.map((r) => (
          <div
            key={r.id}
            className="px-2 not-first:border-t not-first:border-border"
          >
            <RecipeCard recipe={r} />
          </div>
        ))}
      </div>
    </div>
  );
}
