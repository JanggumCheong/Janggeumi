"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { StorageFilter } from "../../_lib/types";
import type { FilterSelection } from "../../_lib/storage-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 보관 필터 — 데이터 3축(form·place·period) 드롭다운. filters와 1:1.
 * 선택 상태(draft)를 소유하고, 변화를 onChange로 알린다(MethodList가 필터링에 사용).
 * 축이 재료마다 달라도 filters 배열을 렌더만 하면 됨(동적).
 * 필터 5개까지 2줄 wrap, 그 이상이면 스크롤/바텀시트 검토(현재 3축).
 */
export function StorageFilters({
  filters,
  onChange,
}: {
  filters: StorageFilter[];
  onChange?: (selection: FilterSelection) => void;
}) {
  // draft: 축(key) → 선택 옵션. 미선택이면 undefined(=전체).
  const [selection, setSelection] = useState<FilterSelection>({});

  const select = (key: string, value: string | undefined) => {
    const next = { ...selection, [key]: value };

    setSelection(next);
    onChange?.(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const current = selection[f.key];
        const on = current != null;

        return (
          <DropdownMenu key={f.key}>
            {/* base-ui: asChild가 아니라 render로 커스텀 요소를 대체 렌더(button 중첩 방지) */}
            <DropdownMenuTrigger
              className={[
                "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-[7px] text-[13px] transition-colors",
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-jg-ink-sub hover:border-jg-ink-mute",
              ].join(" ")}
            >
              {on ? current : f.label}
              <ChevronDown className="size-3.5 opacity-70" />
            </DropdownMenuTrigger>
            {/* 장금이 오버레이 스타일 (design-system.md 4장): surface 배경, r-md, 진한 float 그림자로
                아래 카드 위에 확실히 떠 보이게(겹침이 깔끔). ring으로 경계 강조. */}
            <DropdownMenuContent
              align="start"
              sideOffset={6}
              className="flex min-w-[150px] flex-col gap-0.5 rounded-[16px] border border-border bg-card p-1.5 shadow-[0_10px_30px_rgba(31,29,24,0.18)] ring-1 ring-black/5"
            >
              {/* 전체(선택 해제) — 맨 위 */}
              <FilterOption
                label="전체"
                selected={!on}
                onSelect={() => select(f.key, undefined)}
              />
              {f.options.map((opt) => (
                <FilterOption
                  key={opt}
                  label={opt}
                  selected={current === opt}
                  onSelect={() => select(f.key, opt)}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}

/** 드롭다운 옵션 하나 — 선택 시 초록 배경+글자+체크 (design-system.md 오버레이 규격). */
function FilterOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem
      onClick={onSelect}
      className={[
        // hover/focus는 무채색(sunken)으로 — 선택색(연초록)과 구분. 기본 focus:bg-accent 덮어씀.
        "cursor-pointer gap-1.5 rounded-[10px] px-2.5 py-2 text-sm focus:bg-muted data-highlighted:bg-muted",
        selected
          ? "bg-secondary font-bold text-primary focus:bg-secondary data-highlighted:bg-secondary"
          : "text-foreground",
      ].join(" ")}
    >
      <span className="flex-1">{label}</span>
      {selected && <Check className="size-4 text-primary" />}
    </DropdownMenuItem>
  );
}
