import type { ProbLevel } from "../../_lib/probability";
import { calcProbability, probLevel, probCaption } from "../../_lib/probability";

/**
 * 확률 게이지 (순수 표시). 체크 수(checked)/전체(total)만 받아 확률·상태색을 그린다.
 * 체크 상태(draft)는 CriteriaChecklist가 소유 — 게이지는 숫자만 관심.
 * 상단 sticky. 색은 재료 무관 '구매 시스템 색'이되, 상태(level)에 따라 중립→주의→초록.
 *
 * 색은 인라인 스타일(hex)로 준다: 상태가 동적으로 바뀌므로 Tailwind가 클래스를
 * 정적 감지하지 못하는 문제를 피하고, sticky에서도 배경이 확실히 불투명하게 칠해진다.
 */

// 상태별 색 세트 (hex). 재료색 아님 — 구매 시스템 색.
const LEVEL_COLOR: Record<
  ProbLevel,
  { box: string; border: string; accent: string; bar: string; track: string }
> = {
  empty: { box: "#f4f4f2", border: "#e7e4dc", accent: "#9b978c", bar: "#9b978c", track: "#e3e1db" }, // 중립
  low: { box: "#FBF3E2", border: "#EBD9AE", accent: "#B0843A", bar: "#B0843A", track: "#EBD9AE" }, // 주의(황)
  mid: { box: "#E9F6EE", border: "#CFE8DA", accent: "#1F804D", bar: "#1F804D", track: "#CFE8DA" }, // 양호(초록)
  high: { box: "#E9F6EE", border: "#CFE8DA", accent: "#1F804D", bar: "#1F804D", track: "#CFE8DA" }, // 좋음(초록)
};

export function ProbabilityGauge({
  label,
  checked,
  total,
}: {
  label: string;
  /** 체크된 기준 수 (분자). */
  checked: number;
  /** 전체 기준 수 (분모). */
  total: number;
}) {
  const pct = calcProbability(checked, total);
  const level = probLevel(pct);
  const c = LEVEL_COLOR[level];

  return (
    <div
      className="sticky top-[108px] z-10 rounded-[20px] border p-4 shadow-[0_2px_10px_rgba(31,29,24,0.05)] transition-colors"
      style={{ backgroundColor: c.box, borderColor: c.border }}
    >
      <div
        className="text-xs font-bold transition-colors"
        style={{ color: c.accent }}
      >
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <span
          className="text-[34px] font-extrabold leading-none transition-colors"
          style={{ color: c.accent }}
        >
          {pct}%
        </span>
        <span className="text-xs text-jg-ink-sub">{probCaption(pct)}</span>
      </div>
      <div
        className="mt-2.5 h-[9px] overflow-hidden rounded-full transition-colors"
        style={{ backgroundColor: c.track }}
      >
        <div
          className="h-full rounded-full transition-[width,background-color] duration-300"
          style={{ width: `${pct}%`, backgroundColor: c.bar }}
        />
      </div>
      <div className="mt-2 text-[11.5px] text-jg-ink-sub">
        ✔ {checked} / {total} 기준 충족
      </div>
    </div>
  );
}
