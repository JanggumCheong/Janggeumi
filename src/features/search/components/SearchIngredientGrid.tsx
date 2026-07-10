import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { Ingredient } from "../types";

type SearchIngredientGridProps = {
  category: string;
  items: Ingredient[];
};

export function SearchIngredientGrid({ category, items }: SearchIngredientGridProps) {
  if (items.length === 0) {
    return (
      <p className="col-span-4 py-10 text-center text-sm text-jg-ink-mute">
        조건에 맞는 재료가 없어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-x-2 gap-y-5 pt-5">
        {items.map((item) =>
          item.comingSoon ? (
            // 가데이터: 상세로 이동할 수 없어 링크가 아닌 비활성 카드로 노출한다.
            <div
              key={item.slug}
              aria-disabled
              className="relative flex cursor-not-allowed flex-col items-center overflow-hidden rounded-sm border bg-card text-center opacity-60"
            >
              <Badge variant="secondary" className="absolute top-1 right-1 z-10 px-1.5 text-[10px]">
                준비중
              </Badge>
              <IngredientCardBody item={item} />
            </div>
          ) : (
            <Link
              key={item.slug}
              href={`/ingredients/${item.slug}`}
              className="flex flex-col items-center overflow-hidden rounded-sm border bg-card text-center"
            >
              <IngredientCardBody item={item} />
            </Link>
          ),
        )}
      </div>
      <span className="text-xs text-primary font-semibold">
        {`${category} 검색 결과 ${items.length}가지를 가나다순으로 보여드려요.`}
      </span>
    </div>
  );
}

function IngredientCardBody({ item }: { item: Ingredient }) {
  return (
    <>
      <div className="relative grid aspect-square w-full place-items-center overflow-hidden text-3xl">
        {item.imageSrc ? (
          <ImageWithFallback
            src={item.imageSrc}
            alt={`${item.name} 이미지`}
            fill
            className="object-cover"
            sizes="25vw"
            fallback={<span className="text-3xl">{item.emoji}</span>}
          />
        ) : (
          <span aria-hidden="true">{item.emoji}</span>
        )}
      </div>
      <div className="flex w-full flex-col items-center bg-background p-2">
        <span className="text-sm font-semibold">{item.name}</span>
      </div>
    </>
  );
}
