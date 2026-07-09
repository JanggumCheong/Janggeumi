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
};

export type SeasonalIngredient = Ingredient & { season: string };
