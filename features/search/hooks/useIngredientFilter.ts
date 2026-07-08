"use client";

import { useMemo } from "react";
import { INGREDIENTS } from "../data";
import type { CategoryOption, Ingredient, SortKey } from "../types";

/** 카테고리·검색어·정렬 기준에 따라 재료 목록을 필터링·정렬한다. */
export function useIngredientFilter(
  category: CategoryOption,
  sort: SortKey,
  query: string,
): Ingredient[] {
  return useMemo(() => {
    let items = INGREDIENTS.filter((i) => category === "전체" || i.category === category);
    if (query.trim()) items = items.filter((i) => i.name.includes(query.trim()));
    const sorted = [...items];
    if (sort === "인기순") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "가나다순") sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    else sorted.sort((a, b) => Number(b.inSeason) - Number(a.inSeason) || b.rating - a.rating);
    return sorted;
  }, [category, sort, query]);
}
