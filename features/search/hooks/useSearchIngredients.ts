"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchIngredients, type SearchParams } from "../api";

/**
 * 제출된 검색어로 재료를 검색한다.
 * - enabled=false(미제출)이면 요청하지 않는다.
 * - 정렬·카테고리 변경 시엔 이전 결과를 유지(keepPreviousData)해 깜빡임을 막는다.
 *   → 로딩 스켈레톤은 첫 검색(이전 데이터 없음)에서만 노출된다.
 */
export function useSearchIngredients(params: SearchParams, enabled: boolean) {
  return useQuery({
    queryKey: ["search", params.query, params.category],
    queryFn: () => searchIngredients(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
