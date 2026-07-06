"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RECIPE_SORTS, type RecipeSortKey } from "./recipe-sort";

/**
 * 레시피 정렬 드롭다운 — 개수 표시 + 정렬 선택 (보관 필터의 오버레이 규격 재사용).
 * 선택 상태는 소유하지 않고 현재값 + 변경 알림만(상태는 컨테이너 소유).
 * base-ui: asChild가 아니라 render/className 직접(button 중첩 방지).
 */
export function RecipeSort({
  count,
  value,
  onChange,
}: {
  count: number;
  value: RecipeSortKey;
  onChange: (key: RecipeSortKey) => void;
}) {
  const current = RECIPE_SORTS.find((s) => s.key === value) ?? RECIPE_SORTS[0];

  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-jg-ink-sub">레시피 {count}개</span>

      <DropdownMenu>
        {/* 보관 필터와 완전 동일 구조. 색만 처리 액센트(주황): hover 테두리 + focus 아웃라인만.
            열린 상태·텍스트엔 색 변화 주지 않음(보관과 동일). */}
        <DropdownMenuTrigger className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border bg-card px-3 py-[7px] text-[13px] text-jg-ink-sub transition-colors outline-jg-use hover:border-jg-use">
          {current.label}
          <ChevronDown className="size-3.5 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="flex min-w-[130px] flex-col gap-0.5 rounded-[16px] border border-border bg-card p-1.5 shadow-[0_10px_30px_rgba(31,29,24,0.18)] ring-1 ring-black/5"
        >
          {RECIPE_SORTS.map((s) => {
            const selected = s.key === value;
            return (
              <DropdownMenuItem
                key={s.key}
                onClick={() => onChange(s.key)}
                className={[
                  "cursor-pointer gap-1.5 rounded-[10px] px-2.5 py-2 text-sm focus:bg-muted data-highlighted:bg-muted",
                  selected && "bg-jg-use-bg font-bold focus:bg-jg-use-bg data-highlighted:bg-jg-use-bg",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* ⚠️ shadcn 기본 `focus:**:text-accent-foreground`가 hover 시 자손 전부(=svg 안 <path>
                    까지) 세이지로 물들인다. svg에 text-*를 걸어도 <path>는 base-ui의 `**:`가 직접 잡아
                    상속을 이긴다. → 체크는 `**:text-jg-use!`로 path까지, span은 직접 색을 `!`로 확정. */}
                <span className={selected ? "flex-1 text-jg-use!" : "flex-1 text-foreground!"}>
                  {s.label}
                </span>
                {selected && <Check className="size-4 text-jg-use! **:text-jg-use!" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
