/**
 * 레시피 정렬 로직 (순수 함수 — UI와 분리).
 * 확산형은 카테고리 필터 없이 '정렬만'(H2). 정렬 키가 늘어도 여기만 확장.
 */
import type { Recipe } from "../../_lib/types";

export type RecipeSortKey = "popular" | "comments" | "latest";

export const RECIPE_SORTS: { key: RecipeSortKey; label: string }[] = [
  { key: "popular", label: "인기순" },
  { key: "comments", label: "댓글순" },
  { key: "latest", label: "최신순" },
];

/** 좋아요/댓글 수로 정렬. 데이터를 복사해 정렬(원본 불변). */
export function sortRecipes(recipes: Recipe[], key: RecipeSortKey): Recipe[] {
  const copy = [...recipes];

  if (key === "popular") {
    return copy.sort((a, b) => (b.reaction?.likes ?? 0) - (a.reaction?.likes ?? 0));
  }

  if (key === "comments") {
    return copy.sort((a, b) => (b.reaction?.comments ?? 0) - (a.reaction?.comments ?? 0));
  }

  // latest: 데이터 순서를 신뢰(작성일 필드 도입 전까지는 입력 순).
  return copy;
}
