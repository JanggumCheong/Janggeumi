/**
 * 재료 데이터 로더 — slug로 재료 상세를 조회한다.
 *
 * JSON을 IngredientSchema.parse()로 런타임 검증한다:
 * - 데이터가 스키마와 어긋나면 로드 시점에 에러(강제 단언 as unknown as 없음).
 * - 반환 타입은 스키마에서 파생된 Ingredient — 완전한 타입 안전.
 * 나중에 API/DB로 바뀌어도 이 파일의 함수 시그니처만 유지하면 화면 코드는 그대로다.
 */
import type { Ingredient, IngredientTab } from "./types";
import { IngredientSchema, INGREDIENT_TABS } from "./types";
import { getIngredientFromApi } from "./api-adapter";
import { fetchIngredientMeta } from "./queries/ingredient-meta";
import { emojiFor } from "./slug";

import watermelon from "./data/watermelon.json";
import potato from "./data/potato.json";
import greenOnion from "./data/green-onion.json";

// slug → 검증된 데이터. 재료가 늘면 여기만 추가하면 된다.
const INGREDIENTS: Record<string, Ingredient> = {
  watermelon: IngredientSchema.parse(watermelon),
  potato: IngredientSchema.parse(potato),
  "green-onion": IngredientSchema.parse(greenOnion),
};

/** 전체 재료 slug 목록 (generateStaticParams 등에 사용). */
export function getIngredientSlugs(): string[] {
  return Object.keys(INGREDIENTS);
}

/** slug로 재료 상세 조회. 없으면 null. */
export function getIngredient(slug: string): Ingredient | null {
  return INGREDIENTS[slug] ?? null;
}

/**
 * 로컬 JSON에 없는 재료(API에만 있는 신규 재료)용 최소 base.
 * 어댑터가 이 위에 API 데이터를 얹는다. 보관·처리에 API 데이터가 없으면 빈 상태로 남는다.
 * emoji는 API가 주지 않으므로 slug 매핑에서 채운다.
 */
function emptyBase(slug: string, name: string): Ingredient {
  return {
    id: slug,
    name,
    category: "vegetable",
    emoji: emojiFor(slug),
    summary: "",
    purchase: { headline: `좋은 ${name} 고르는 법`, criteria: [] },
    storage: { headline: `${name} 보관 방법`, filters: [], methods: [] },
    handling: { headline: `${name} 활용·폐기`, recipes: [] },
  };
}

/**
 * 상세 화면용 재료 조회.
 * API 응답을 프론트 Ingredient 모델로 어댑팅한다.
 * - 로컬 JSON에 있는 재료: 그 데이터를 base로 (API가 흔들려도 보강 폴백).
 * - 로컬에 없는 재료(peach 등): API 메타로 존재 확인 후 빈 base로 시도. 없으면 null.
 */
export async function getIngredientDetail(slug: string): Promise<Ingredient | null> {
  const local = getIngredient(slug);
  if (local) return getIngredientFromApi(slug, local);

  // 로컬에 없는 재료 — API에 존재하면 빈 base로 어댑팅.
  const meta = await fetchIngredientMeta(slug);
  if (!meta) return null;
  return getIngredientFromApi(slug, emptyBase(slug, meta.name));
}

/** slug → 재료 이름(헤더 제목 등 가벼운 조회용). 없으면 null. */
export function getIngredientName(slug: string): string | null {
  return INGREDIENTS[slug]?.name ?? null;
}

/** 유효한 탭인지 검사 (URL 세그먼트 검증용). */
export function isValidTab(tab: string): tab is IngredientTab {
  return (INGREDIENT_TABS as string[]).includes(tab);
}
