import Link from "next/link";
import type { Ingredient } from "../types";

type SearchIngredientGridProps = {
  category: string;
  items: Ingredient[];
};

export function SearchIngredientGrid({ category, items }: SearchIngredientGridProps) {
  return (
    <>
      {items.length !== 0 ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-x-2 gap-y-5 pt-5">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`/ingredients/${item.slug}`}
                className="flex flex-col items-center text-center overflow-hidden border rounded-sm bg-card"
              >
                <div className="grid aspect-square w-full place-items-center text-3xl">
                  {item.emoji}
                </div>
                <div className="flex flex-col items-center bg-background w-full p-2">
                  <span className="text-sm font-semibold">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
          <span className="text-xs text-primary font-semibold">
            {`${category} 검색 결과 ${items.length}가지를 가나다순으로 보여드려요.`}
          </span>
        </div>
      ) : (
        <></>
      )}
      {items.length === 0 && (
        <p className="col-span-4 py-10 text-center text-sm text-jg-ink-mute">
          조건에 맞는 재료가 없어요.
        </p>
      )}
    </>
  );
}
