"use client";

import type { HandlingArea } from "./area";

/**
 * 처리 탭 내부 하위 세그먼트 — 활용 vs 폐기 (H1: 두 고민은 다르다).
 * 탭(URL) 아래 한 단계 더 얕은 전환이라 세그먼트로. 활성색은 처리 액센트(주황).
 * 선택 상태는 소유하지 않고, 현재값 + 변경 알림만 받는다(상태는 컨테이너 소유).
 */
const AREAS: { key: HandlingArea; label: string; icon: string }[] = [
  { key: "recipe", label: "활용 처리", icon: "🍽" },
  { key: "dispose", label: "폐기 처리", icon: "🗑" },
];

export function HandlingSubSegment({
  value,
  onChange,
}: {
  value: HandlingArea;
  onChange: (area: HandlingArea) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="처리 방식"
      className="flex gap-2 rounded-full bg-muted p-1"
    >
      {AREAS.map((a) => {
        const on = a.key === value;
        return (
          <button
            key={a.key}
            type="button"
            role="tab"
            id={`handling-tab-${a.key}`}
            aria-selected={on}
            aria-controls={`handling-panel-${a.key}`}
            onClick={() => onChange(a.key)}
            className={[
              // 세그먼트 활성 버튼은 bg-card(흰색)라 outline은 offset(양수=바깥 muted 띠, 음수=안쪽 흰
              // 띠) 어느 쪽이든 링이 뜬다. → outline 대신 ring(box-shadow)으로 버튼 경계에 정확히 밀착.
              // 색은 필터와 동일하게 처리 액센트 주황 50% 반투명.
              "flex-1 rounded-full py-2 text-[13px] font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-jg-use/50",
              on
                ? "bg-card text-jg-use shadow-[0_2px_10px_rgba(31,29,24,0.06)]"
                : "text-jg-ink-sub",
            ].join(" ")}
          >
            <span aria-hidden className="mr-1">
              {a.icon}
            </span>
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
