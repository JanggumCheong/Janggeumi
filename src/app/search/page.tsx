"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HOTS,
  SEASONAL,
  SearchBar,
  SearchCarousel,
  SearchCategoryFilter,
  SearchGuideBox,
  SearchIngredientGrid,
  useSearchIngredients,
  type CategoryOption,
} from "@/features/search";

/**
 * 검색 페이지. 재료를 찾는 단일 화면.
 * - 미검색(기본) · 타이핑 중: 🔥·🌱 캐러셀 + 카테고리 칩 + 안내(발견·제안 상태).
 * - 검색 실행(Enter/돋보기) 후: 로딩 → 정렬 탭 + 결과 그리드.
 * 검색어 입력만으로는 화면이 바뀌지 않고, "실행"해야 결과 모드로 전환된다.
 */
export default function SearchPage() {
  const [category, setCategory] = useState<CategoryOption>("전체");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const hasSearched = submittedQuery.trim().length > 0;
  const { data: results, isFetching } = useSearchIngredients(
    { query: submittedQuery, category },
    hasSearched,
  );

  // 입력을 비우면(검색창 X/전체 삭제) 발견 모드로 되돌린다.
  const handleChange = (value: string) => {
    setQuery(value);
    if (value.trim() === "") setSubmittedQuery("");
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        value={query}
        onChange={handleChange}
        onSubmit={() => setSubmittedQuery(query)}
        autoFocus
      />
      {hasSearched ? (
        <section>
          {isFetching && !results ? (
            <div className="grid grid-cols-4 gap-x-2 gap-y-5 pt-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-sm" />
              ))}
            </div>
          ) : (
            <>
              <SearchCategoryFilter value={category} onChange={setCategory} />
              <SearchIngredientGrid category={category} items={results ?? []} />
            </>
          )}
        </section>
      ) : (
        <>
          <SearchCarousel title="🔥 지금 많이 찾는 재료" sortBy="조회순" list={HOTS} />
          <SearchCarousel title="🌱 지금 제철 재료" list={SEASONAL} />
          <SearchGuideBox />
        </>
      )}
    </div>
  );
}
