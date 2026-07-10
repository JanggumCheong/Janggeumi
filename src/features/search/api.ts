import { z } from "zod";
import { apiUrl } from "@/lib/api";
import { FRUIT_EMOJI, INGREDIENTS } from "./data";
import type { CategoryOption, Ingredient } from "./types";

export type SearchParams = {
  query: string;
  category: CategoryOption;
};

/** 과일 검색 API 응답 항목. 필요한 필드만 검증하고 나머지는 무시한다. */
const ApiFruitSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string().nullable().optional(),
  peak_months: z.array(z.number()).nullable().optional(),
});

/**
 * 재료 검색.
 * - "과일"·"전체": 과일 검색 API에 요청한다(현재 API가 있는 유일한 카테고리).
 * - "전체": API 과일 결과 뒤에 가데이터(비과일)에서 검색된 항목을 붙인다.
 * - 그 외 카테고리: 가데이터로만 검색한다.
 *
 * 가데이터로 나온 항목은 상세로 이동할 수 없으므로 comingSoon(=준비중)으로 표시한다.
 */
export async function searchIngredients({ query, category }: SearchParams): Promise<Ingredient[]> {
  const keyword = query.trim();

  if (category === "과일") {
    return searchFruitsFromApi(keyword);
  }

  if (category === "전체") {
    const [fruits, mock] = await Promise.all([
      searchFruitsFromApi(keyword),
      Promise.resolve(searchMock(keyword)),
    ]);
    // 과일은 API 결과가 우선, 가데이터(비과일)는 뒤에 붙인다.
    return [...fruits, ...mock];
  }

  return searchMock(keyword, category);
}

/** 과일 검색 API 호출 → Ingredient 매핑. 실패 시 빈 배열(화면은 "결과 없음"). */
async function searchFruitsFromApi(keyword: string): Promise<Ingredient[]> {
  try {
    const path = `/v1/categories/FRUIT/ingredients?name=${encodeURIComponent(keyword)}`;
    const response = await fetch(apiUrl(path), { cache: "no-store" });
    if (!response.ok) return [];

    const parsed = z.array(ApiFruitSchema).safeParse(await response.json());
    if (!parsed.success) return [];

    return parsed.data.map(toFruitIngredient);
  } catch {
    return [];
  }
}

/** API 과일 항목 → Ingredient(상세 이동 가능). */
function toFruitIngredient(item: z.infer<typeof ApiFruitSchema>): Ingredient {
  const slug = apiIdToSlug(item.id);
  return {
    slug,
    name: item.name,
    emoji: FRUIT_EMOJI[slug] ?? "🍎",
    imageSrc: normalizeImageSrc(item.image_url),
    rating: 0,
    category: "과일",
    inSeason: isInSeason(item.peak_months),
  };
}

/**
 * API 이미지 경로 정규화.
 * - http(s) 절대 URL은 그대로.
 * - "public/" 접두는 제거하고, 앞에 "/"를 붙여 정적 경로로 만든다.
 * - 값이 없으면 undefined(→ 이모지로 대체).
 */
function normalizeImageSrc(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;

  const withoutPublic = imageUrl.replace(/^public\//, "");
  return withoutPublic.startsWith("/") ? withoutPublic : `/${withoutPublic}`;
}

/** 가데이터 검색. 항목마다 comingSoon 을 붙여 "준비중"으로 노출한다. */
function searchMock(keyword: string, category?: CategoryOption): Ingredient[] {
  return INGREDIENTS.filter(
    (item) =>
      (category === undefined || category === "전체" || item.category === category) &&
      (keyword === "" || item.name.includes(keyword)),
  ).map((item) => ({ ...item, comingSoon: true }));
}

/** API id(ing_shine_muscat) → 프론트 slug(shine-muscat). */
function apiIdToSlug(id: string): string {
  return id.replace(/^ing_/, "").replaceAll("_", "-");
}

/** peak_months 에 이번 달(1~12)이 포함되면 제철로 본다. */
function isInSeason(peakMonths: number[] | null | undefined): boolean {
  if (!peakMonths || peakMonths.length === 0) return false;
  const month = new Date().getMonth() + 1;
  return peakMonths.includes(month);
}
