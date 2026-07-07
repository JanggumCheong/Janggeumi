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
 * 상세 화면용 재료 조회.
 * API 응답을 현재 프론트 Ingredient 모델로 어댑팅하고, API가 없거나 흔들리면 로컬 JSON으로 폴백한다.
 */
export async function getIngredientDetail(slug: string): Promise<Ingredient | null> {
  const fallback = getIngredient(slug);
  if (!fallback) return null;

  return getIngredientFromApi(slug, fallback);
}

/** slug → 재료 이름(헤더 제목 등 가벼운 조회용). 없으면 null. */
export function getIngredientName(slug: string): string | null {
  return INGREDIENTS[slug]?.name ?? null;
}

/** 유효한 탭인지 검사 (URL 세그먼트 검증용). */
export function isValidTab(tab: string): tab is IngredientTab {
  return (INGREDIENT_TABS as string[]).includes(tab);
}
