"use client";

import Link from "next/link";
import { SEASONAL } from "../data";
import { useHorizontalWheel } from "../hooks";
import { SearchRating } from "./SearchRating";

export function SearchSeasonalCarousel() {
  const scrollRef = useHorizontalWheel<HTMLDivElement>();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">지금 제철 재료</h2>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {SEASONAL.map((item) => (
          <Link
            key={item.slug}
            href={`/ingredients/${item.slug}`}
            className="flex w-31 shrink-0 flex-col gap-1 rounded-lg p-3 bg-card border border-border shadow-xs shadow-gray-100"
          >
            <div className="grid h-23 place-items-center rounded-sm text-4xl">{item.emoji}</div>
            <span className="text-sm font-semibold">{item.name}</span>
            <span className="w-fit items-center py-0.5 text-xs font-semibold text-jg-buy flex gap-1">
              <span className="bg-jg-buy-bg rounded-full px-2 py-0.5">제철</span>
              <span>{item.season}</span>
            </span>
            <span>
              <SearchRating value={item.rating} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
