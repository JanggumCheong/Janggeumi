"use client";

import Link from "next/link";
import type { SeasonalIngredient } from "../types";
import { useHorizontalWheel } from "../hooks";

type SearchCarouselProps = {
  title: string;
  sortBy?: string;
  list: SeasonalIngredient[];
};

export function SearchCarousel({ title, sortBy, list }: SearchCarouselProps) {
  const scrollRef = useHorizontalWheel<HTMLDivElement>();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">{title}</h2>
        {sortBy && <span className="text-sm text-muted-foreground font-semibold">{sortBy}</span>}
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {list.map((item) => (
          <Link
            key={item.slug}
            href={`/ingredients/${item.slug}`}
            className="flex w-31 shrink-0 flex-col gap-1 rounded-lg p-3 bg-card border border-border shadow-xs shadow-gray-100"
          >
            <div className="grid h-23 place-items-center rounded-sm text-4xl">{item.emoji}</div>
            <span className="text-sm font-semibold">{item.name}</span>
            <span className="w-fit items-center py-0.5 text-xs font-semibold text-jg-buy flex gap-1">
              <span className="bg-jg-buy-bg rounded-full px-2 py-0.5">제철 {item.season}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
