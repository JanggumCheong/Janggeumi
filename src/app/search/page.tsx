"use client";

import { useState } from "react";
import {
  SearchBar,
  SearchCategoryFilter,
  SearchIngredientGrid,
  SearchSeasonalCarousel,
  SearchSortTabs,
  useIngredientFilter,
  type CategoryOption,
  type SortKey,
} from "../../../features/search";

export default function SearchPage() {
  const [category, setCategory] = useState<CategoryOption>("전체");
  const [sort, setSort] = useState<SortKey>("인기순");
  const [query, setQuery] = useState("");

  const list = useIngredientFilter(category, sort, query);

  // 공통 layout(src/app/layout.tsx)이 Header·TabBar·main 셸을 제공한다.
  // 여기선 셸 안 콘텐츠만 렌더한다(자체 min-h-screen·main 중복 금지).
  return (
    <div className="flex flex-col gap-4">
      <SearchBar value={query} onChange={setQuery} />
      <SearchCategoryFilter value={category} onChange={setCategory} />
      <SearchSeasonalCarousel />
      <section>
        <SearchSortTabs value={sort} onChange={setSort} />
        <SearchIngredientGrid items={list} />
      </section>
    </div>
  );
}
