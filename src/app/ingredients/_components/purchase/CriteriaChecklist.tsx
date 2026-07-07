"use client";

import { useState } from "react";
import type { PurchaseCriterion } from "../../_lib/types";

/**
 * 기준 체크리스트 — criteria(기준 목록)와 체크 상태(draft)를 모두 소유(응집).
 * 2열 편집 디자인: 카드 테두리 없이 구분선 + 번호, 이미지 우하단 뒤 레이어, 텍스트 앞 레이어 + 흰 후광.
 * 선택 = 은은한 초록 배경. 체크 수가 바뀌면 onCheckedChange로 밖(게이지)에 숫자만 알린다.
 */
export function CriteriaChecklist({
  criteria,
  defaultChecked = [],
  onCheckedChange,
}: {
  criteria: PurchaseCriterion[];
  /** 초기 체크 상태 (외부 주입). */
  defaultChecked?: string[];
  /** 체크 수 변화 알림 (게이지가 확률 계산에 사용). */
  onCheckedChange?: (count: number) => void;
}) {
  // draft: 변경분만. null이면 외부 초기값을 따른다(파생 상태).
  const [draft, setDraft] = useState<Set<string> | null>(null);
  const checked = draft ?? new Set(defaultChecked);

  const toggle = (key: string) => {
    // next를 먼저 계산 → setDraft와 onCheckedChange를 각각 호출.
    // (setDraft 업데이터 안에서 부모 setState를 부르면 "render 중 setState" 경고)
    const next = new Set(checked);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    setDraft(next);
    onCheckedChange?.(next.size);
  };

  return (
    <ul className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-border bg-card shadow-[0_2px_10px_rgba(31,29,24,0.05)]">
      {criteria.map((c, i) => {
        const on = checked.has(c.key);
        const isRightCol = i % 2 === 1;
        const isFirstRow = i < 2;
        return (
          <li key={c.key} className="contents">
            <button
              type="button"
              onClick={() => toggle(c.key)}
              aria-pressed={on}
              className={[
                "relative flex min-h-[116px] cursor-pointer flex-col overflow-hidden p-3 text-left transition-colors",
                isRightCol ? "border-l border-border" : "",
                isFirstRow ? "" : "border-t border-border",
                on ? "bg-jg-buy-bg" : "hover:bg-black/[0.015]",
              ].join(" ")}
            >
              {/* 텍스트 (카드 내 이미지 위 레이어 — z-[1]로 카드 안에서만. sticky 게이지(z-20)보다는 아래) */}
              <div
                className="relative z-[1]"
                style={{
                  textShadow: "0 0 3px #fff, 0 0 3px #fff, 0 0 6px #fff, 0 0 6px #fff",
                }}
              >
                <div
                  className={`text-[13.5px] font-extrabold ${on ? "text-jg-buy" : "text-foreground"}`}
                >
                  <span className="text-jg-buy">{i + 1}.</span> {c.title}
                </div>
                <div className="mt-1 text-[11.5px] leading-[1.45] text-jg-ink-sub">{c.desc}</div>
              </div>

              {/* 이미지 (우하단 뒤 레이어). image 있으면 그것, 없으면 이모지 자리표시. */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-1 right-1 z-0 text-[42px] opacity-90"
              >
                {emojiFor(c.key)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** 기준 key → 자리표시 이모지 (실제 사진 확보 전까지). */
function emojiFor(key: string): string {
  const map: Record<string, string> = {
    navel: "🍈",
    stripe: "🍉",
    sound: "✋",
    groundspot: "🟡",
    shape: "⚪",
    weight: "⚖️",
  };
  return map[key] ?? "🥗";
}
