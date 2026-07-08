"use client";

import { SORTS } from "../data";
import type { SortKey } from "../types";

type SearchSortTabsProps = {
  value: SortKey;
  onChange: (sort: SortKey) => void;
};

export function SearchSortTabs({ value, onChange }: SearchSortTabsProps) {
  return (
    <div className="flex items-center justify-between border-b border-b-border">
      <div className="flex gap-5">
        {SORTS.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`relative pb-2 text-[15px] transition-colors ${active ? "text-foreground text-semibold" : "text-jg-ink-mute text-medium"}`}
            >
              {option}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
