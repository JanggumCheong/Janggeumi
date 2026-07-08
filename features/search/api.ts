import { INGREDIENTS } from "./data";
import type { CategoryOption, Ingredient } from "./types";

export type SearchParams = {
  query: string;
  category: CategoryOption;
};

/**
 * 재료 검색. 지금은 로컬 목(data.ts)을 Promise로 감싼다.
 * 실제 검색 GET 엔드포인트(예: /v1/search?q=)가 생기면
 * 이 함수 본문만 fetch(apiUrl(...))로 교체하면 된다(호출부는 그대로).
 */
export async function searchIngredients({ query, category }: SearchParams): Promise<Ingredient[]> {
  // 네트워크 지연 흉내(로딩 상태 확인용). 실제 엔드포인트 연결 시 제거.
  await new Promise((resolve) => setTimeout(resolve, 300));

  const keyword = query.trim();
  const filtered = INGREDIENTS.filter(
    (item) =>
      (category === "전체" || item.category === category) &&
      (keyword === "" || item.name.includes(keyword)),
  );

  return filtered;
}
