/**
 * 재료 메타 조회 — 존재 확인 + 이름.
 *
 * 재료 상세 진입 시 "이 재료가 있나 + 이름 뭐냐"를 API로 확인한다
 * (하드코딩 로컬 목록에 없는 신규 재료도 대응 — peach 등).
 * 엔드포인트는 구매와 동일(/v1/ingredients/{id}).
 *
 * ⚠️ "재료 없음"과 "API 실패"를 구분한다:
 * - 200 + null 본문(이름 없음) = **진짜 없는 재료** → null 반환(발화 안내로 감).
 * - 타임아웃·5xx·네트워크 오류 = **일시 실패** → 재시도, 그래도 안 되면 throw.
 *   (onrender 무료티어는 콜드스타트가 잦아, 실패를 '없음'으로 오판하면 정식 재료가 발화로 샌다.)
 */
import { apiUrl } from "@/lib/api";
import { toApiId } from "../slug";

export interface IngredientMeta {
  slug: string;
  name: string;
}

/** 실패(재료 없음이 아니라 통신 실패)를 나타내는 에러 — 호출부가 '없음'과 구분하도록. */
export class IngredientMetaFetchError extends Error {}

/** 넉넉한 타임아웃(콜드스타트 대비). 재시도 사이 백오프. */
const TIMEOUT_MS = 12_000;
const RETRIES = 3;
const BACKOFF_MS = 800;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 재료 메타 조회.
 * - 재료 없음(200+null): null
 * - 통신 실패(타임아웃·5xx·네트워크): 재시도 후에도 실패면 IngredientMetaFetchError throw
 */
export async function fetchIngredientMeta(
  slug: string,
): Promise<IngredientMeta | null> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    if (attempt > 0) await sleep(BACKOFF_MS * attempt); // 점증 백오프

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(apiUrl(`/v1/ingredients/${toApiId(slug)}`), {
        cache: "no-store",
        signal: controller.signal,
      });

      // 5xx는 일시 실패로 보고 재시도. 4xx는 재료 없음으로 간주.
      if (res.status >= 500) {
        lastError = new Error(`meta ${res.status}`);
        continue;
      }
      if (!res.ok) return null; // 404 등 — 없는 재료

      const json = (await res.json()) as {
        ingredient?: { name?: string } | null;
      } | null;
      const name = json?.ingredient?.name;
      return name ? { slug, name } : null; // 200+null body = 없는 재료
    } catch (e) {
      lastError = e; // 타임아웃(abort)·네트워크 오류 → 재시도
    } finally {
      clearTimeout(timer);
    }
  }

  // 재시도 다 실패 = 통신 실패(재료 없음 아님). 호출부가 구분하도록 throw.
  throw new IngredientMetaFetchError(
    `재료 메타 조회 실패: ${slug} (${String(lastError)})`,
  );
}
