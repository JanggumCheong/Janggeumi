/**
 * criteria들의 출처(source)를 유니크하게 집계 (순수 함수).
 * 여러 기준이 같은 출처를 가리키므로 org+type 기준으로 중복 제거.
 */
import type { PurchaseCriterion, Source } from "./types";

/** criteria 배열에서 유니크한 출처 목록을 뽑는다 (등장 순서 유지). */
export function collectSources(criteria: PurchaseCriterion[]): Source[] {
  const seen = new Set<string>();
  const result: Source[] = [];

  for (const c of criteria) {
    if (!c.source) continue;
    const key = `${c.source.org}|${c.source.type}`;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(c.source);
  }
  return result;
}
