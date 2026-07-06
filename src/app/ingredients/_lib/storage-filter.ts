/**
 * 보관 방법 필터링 로직 (순수 함수 — UI와 분리).
 * 필터 선택값과 method.tags를 매칭. 필터 축이 재료마다 달라도 동작(동적).
 */
import type { StorageMethod } from "./types";

/** 축(key) → 선택된 옵션. 값이 없으면(미선택) 그 축은 '전체'. */
export type FilterSelection = Record<string, string | undefined>;

/**
 * 선택값으로 방법을 필터링.
 * 각 method.tags[key]가 선택값과 일치해야 통과(미선택 축은 무시).
 */
export function filterMethods(
  methods: StorageMethod[],
  selection: FilterSelection,
): StorageMethod[] {
  const active = Object.entries(selection).filter(([, v]) => v != null);
  if (active.length === 0) return methods;
  return methods.filter((m) =>
    active.every(([key, value]) => m.tags[key] === value),
  );
}
