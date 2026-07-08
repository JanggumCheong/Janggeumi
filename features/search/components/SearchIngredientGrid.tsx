import Link from "next/link";
import type { Ingredient } from "../types";
import { SearchRating } from "./SearchRating";

type SearchIngredientGridProps = {
  items: Ingredient[];
};

export function SearchIngredientGrid({ items }: SearchIngredientGridProps) {
  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-5 pt-5">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/ingredients/${item.slug}`}
          className="flex flex-col items-center text-center overflow-hidden border rounded-sm bg-card"
        >
          <div className="grid aspect-square w-full place-items-center text-3xl">{item.emoji}</div>
          <div className="flex flex-col items-center bg-background w-full p-2">
            <span className="text-sm font-semibold">{item.name}</span>
          </div>
        </Link>
      ))}
      {items.length === 0 && (
        <p className="col-span-4 py-10 text-center text-sm text-jg-ink-mute">
          조건에 맞는 재료가 없어요.
        </p>
      )}
    </div>
  );
}
