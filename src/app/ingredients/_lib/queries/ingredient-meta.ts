/**
 * 재료 메타 조회 — 존재 확인 + 이름.
 *
 * 재료 상세 진입 시 "이 재료가 있나 + 이름 뭐냐"를 API로 확인한다
 * (하드코딩 로컬 목록에 없는 신규 재료도 대응 — peach 등).
 * 엔드포인트는 구매와 동일(/v1/ingredients/{id}).
 * (emoji는 API가 주지 않아 slug 매핑으로 붙이지만, 그건 base 생성 시 ingredients.ts가 담당한다.)
 */
import { apiUrl } from "@/lib/api";
import { toApiId } from "../slug";

export interface IngredientMeta {
  slug: string;
  name: string;
}

/** 재료 메타 조회. 없으면(에러·null 본문·이름 없음) null. 서버 존재 확인용. */
export async function fetchIngredientMeta(
  slug: string,
): Promise<IngredientMeta | null> {
  try {
    const res = await fetch(apiUrl(`/v1/ingredients/${toApiId(slug)}`), {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      ingredient?: { name?: string } | null;
    } | null;
    const name = json?.ingredient?.name;
    if (!name) return null;

    return { slug, name };
  } catch {
    return null;
  }
}
