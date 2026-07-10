export type Category = "채소" | "과일" | "육류" | "수산" | "유제품" | "곡류";

/** 카테고리 필터에서 선택 가능한 값("전체" 포함) */
export type CategoryOption = "전체" | Category;

export type SortKey = "인기순" | "가나다순";

export type Ingredient = {
  slug: string;
  name: string;
  emoji: string;
  rating: number;
  category: Category;
  inSeason: boolean;
  /** 재료 이미지 경로. API로 받아온 재료만 채워지며, 없으면 이모지로 대체한다. */
  imageSrc?: string;
  /** 아직 검색 API가 없는 가데이터(노출만, 상세 이동 불가). "준비중" 배지로 표시한다. */
  comingSoon?: boolean;
};

export type SeasonalIngredient = Ingredient & { season: string };
