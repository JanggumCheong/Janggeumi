import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import type { Recipe } from "../../_lib/types";

/**
 * 레시피 UGC 카드 하나 — 썸네일 + 제목/설명 + 작성자·반응.
 * 카드 전체가 Link(레시피 상세 — 지금은 준비중 #). 설명 2줄 말줄임.
 * 썸네일은 카테고리 기반 이모지 자리표시(사진 확보 전).
 */
export function RecipeCard({ recipe, href = "#" }: { recipe: Recipe; href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[16px] py-3 transition-colors hover:bg-black/[0.015]"
    >
      <div className="flex size-[60px] flex-none items-center justify-center rounded-[16px] bg-jg-use-bg text-[28px]">
        <span aria-hidden>{thumbFor(recipe)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">{recipe.title}</div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-[1.4] text-jg-ink-sub">{recipe.desc}</p>
        <div className="mt-1.5 flex items-center gap-2.5 text-[11px] text-jg-ink-mute">
          <span className="flex items-center gap-1">
            <span className="flex size-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-jg-primary-strong">
              {recipe.author.name.slice(0, 1)}
            </span>
            {recipe.author.name}
          </span>
          {recipe.reaction && (
            <>
              <span className="flex items-center gap-0.5">
                <Heart className="size-3" />
                {formatCount(recipe.reaction.likes)}
              </span>
              <span className="flex items-center gap-0.5">
                <MessageCircle className="size-3" />
                {recipe.reaction.comments}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/** 레시피 category → 썸네일 자리표시 이모지 (사진 확보 전). */
function thumbFor(r: Recipe): string {
  switch (r.category) {
    case "음료":
      return "🥤";
    case "디저트":
      return "🍧";
    case "요리":
      return "🥗";
    case "김치/절임":
      return "🥬";
    default:
      return "🍽";
  }
}

/** 1000 이상은 1.2k 형태로. */
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
