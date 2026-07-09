"use client";

import { CATEGORIES } from "../data";
import { useHorizontalWheel } from "../hooks";
import type { CategoryOption } from "../types";

type SearchCategoryFilterProps = {
  value: CategoryOption;
  onChange: (category: CategoryOption) => void;
};

export function SearchCategoryFilter({ value, onChange }: SearchCategoryFilterProps) {
  const scrollRef = useHorizontalWheel<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORIES.map((c) => {
        const active = c === value;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
