/**
 * 구매 확률 게이지의 계산·상태 로직 (순수 함수 — UI와 분리).
 * 가중치·문구·색 단계가 바뀌어도 이 파일만 수정하면 된다.
 */

export type ProbLevel = "empty" | "low" | "mid" | "high";

/** 체크한 기준 수 → 확률(%). 현재는 균등 가중. (가중치 도입 시 여기만 변경) */
export function calcProbability(checked: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((checked / total) * 100);
}

/** 확률 → 상태 단계. 0%=중립 / ~33%=주의 / ~66%=양호 / 그 이상=좋음. */
export function probLevel(pct: number): ProbLevel {
  if (pct <= 0) return "empty";
  if (pct <= 33) return "low";
  if (pct <= 66) return "mid";
  return "high";
}

/** 상태 단계 → 안내 문구. */
export function probCaption(pct: number): string {
  if (pct <= 0) return "기준을 확인해보세요";
  if (pct <= 33) return "조금 더 살펴봐요";
  if (pct <= 66) return "괜찮은 편이에요";
  if (pct < 100) return "좋은 재료예요!";
  return "완벽해요! 🎉";
}
